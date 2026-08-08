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

// Identidade do blog "De Cabeça!": base grafite e branco, cor só nas editorias.
const CORES = {
	fundo: [0xff, 0xff, 0xff],
	grafite: [0x23, 0x2b, 0x2b],
	claro: [0x6b, 0x72, 0x72],
	linha: [0xe6, 0xe8, 0xe8],
	editorias: [
		[0x20, 0xa8, 0xe0], // Método
		[0x84, 0x48, 0x90], // Memória
		[0xe4, 0x6c, 0x30], // Edital
		[0x00, 0x9c, 0x9c], // Rotina
		[0xfc, 0xb4, 0x18], // Bastidores
	],
};

/** Retorna a cor do pixel — grafite no topo, e a régua de editorias no rodapé. */
function corDoPixel(x, y) {
	if (y < 120) return CORES.grafite;

	// Rodapé: as cinco editorias em faixas iguais, que é o sistema da marca.
	if (y > ALTURA - 60) {
		const faixa = Math.min(
			CORES.editorias.length - 1,
			Math.floor((x / LARGURA) * CORES.editorias.length)
		);
		return CORES.editorias[faixa];
	}

	// Título em grafite e linhas de texto sugeridas geometricamente.
	if (y > 260 && y < 320 && x > 140 && x < 660) return CORES.grafite;
	if (y > 350 && y < 352 && x > 140 && x < 1060) return CORES.linha;
	if (y > 400 && y < 418 && x > 140 && x < 900) return CORES.claro;
	if (y > 448 && y < 466 && x > 140 && x < 820) return CORES.claro;
	if (y > 496 && y < 514 && x > 140 && x < 620) return CORES.claro;
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
