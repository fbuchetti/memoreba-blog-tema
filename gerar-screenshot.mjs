/**
 * Gera o screenshot.png do tema (1200x900), exigido pelo WordPress para
 * exibir a capa do tema em Aparência > Temas.
 *
 * Escrito à mão com zlib porque o repositório não tem dependências — um tema
 * de blocos não deveria precisar de node_modules só para uma imagem estática.
 *
 * Uso: node gerar-screenshot.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const LARGURA = 1200;
const ALTURA = 900;

const CORES = {
	fundo: [0xfb, 0xfb, 0xfb],
	terracota: [0xd2, 0x67, 0x43],
	roxo: [0x41, 0x26, 0x48],
	texto: [0x33, 0x2c, 0x2c],
};

/** Retorna a cor do pixel — faixas horizontais com a paleta da marca. */
function corDoPixel(x, y) {
	if (y < 120) return CORES.roxo;
	if (y > ALTURA - 60) return CORES.terracota;
	// Bloco de "título" e "linhas de texto" sugeridos geometricamente.
	if (y > 260 && y < 320 && x > 140 && x < 660) return CORES.terracota;
	if (y > 380 && y < 400 && x > 140 && x < 900) return CORES.texto;
	if (y > 430 && y < 450 && x > 140 && x < 820) return CORES.texto;
	if (y > 480 && y < 500 && x > 140 && x < 620) return CORES.texto;
	return CORES.fundo;
}

function montarPixels() {
	// Cada linha começa com o byte de filtro (0 = None).
	const bytesPorLinha = 1 + LARGURA * 3;
	const dados = Buffer.alloc(bytesPorLinha * ALTURA);
	for (let y = 0; y < ALTURA; y += 1) {
		const base = y * bytesPorLinha;
		dados[base] = 0;
		for (let x = 0; x < LARGURA; x += 1) {
			const [r, g, b] = corDoPixel(x, y);
			const p = base + 1 + x * 3;
			dados[p] = r;
			dados[p + 1] = g;
			dados[p + 2] = b;
		}
	}
	return dados;
}

const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k += 1) {
		c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	}
	return c >>> 0;
});

function crc32(buf) {
	let c = 0xffffffff;
	for (const byte of buf) {
		c = TABELA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
	}
	return (c ^ 0xffffffff) >>> 0;
}

function bloco(tipo, dados) {
	const tamanho = Buffer.alloc(4);
	tamanho.writeUInt32BE(dados.length);
	const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(corpo));
	return Buffer.concat([tamanho, corpo, crc]);
}

const cabecalho = Buffer.alloc(13);
cabecalho.writeUInt32BE(LARGURA, 0);
cabecalho.writeUInt32BE(ALTURA, 4);
cabecalho[8] = 8; // bits por canal
cabecalho[9] = 2; // RGB
cabecalho[10] = 0; // compressão padrão
cabecalho[11] = 0; // filtro padrão
cabecalho[12] = 0; // sem entrelaçamento

const png = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	bloco('IHDR', cabecalho),
	bloco('IDAT', deflateSync(montarPixels(), { level: 9 })),
	bloco('IEND', Buffer.alloc(0)),
]);

writeFileSync('screenshot.png', png);
console.log(`screenshot.png gerado: ${LARGURA}x${ALTURA}, ${png.length} bytes`);
