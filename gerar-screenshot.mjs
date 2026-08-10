/**
 * Gera o screenshot.png do tema (1200x900), exigido pelo WordPress para
 * exibir a capa do tema em Aparência > Temas.
 *
 * Escrito à mão com zlib porque o repositório não tem dependências — um tema
 * de blocos não deveria precisar de node_modules só para uma imagem estática.
 *
 * As cores vêm de theme.json (paleta do design system do produto Memoreba) —
 * não da identidade grafite antiga do "De Cabeça!", que este tema já não usa
 * desde a migração para o design system (ver style.css).
 *
 * Uso: node gerar-screenshot.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const LARGURA = 1200;
const ALTURA = 900;

// Paleta de theme.json — base creme, texto grafite-marrom, acentos do
// sistema de caixas editoriais (evidência/prática/atenção/perigo + laranja).
const CORES = {
	base: [0xfa, 0xf7, 0xf0],
	superficie: [0xff, 0xff, 0xff],
	contrast: [0x46, 0x3f, 0x34],
	contrast2: [0x5c, 0x54, 0x48],
	contrast3: [0xde, 0xd7, 0xc8],
	acentos: [
		[0xb0, 0x4e, 0x2e], // Laranja
		[0x1f, 0x7a, 0x71], // Teal
		[0x23, 0x3c, 0x50], // Petróleo
		[0x24, 0x7a, 0x55], // Sucesso
		[0x9a, 0x67, 0x20], // Atenção
	],
};

const HEADER_ALTURA = 96;
const CARTAO = { x0: 140, y0: 150, x1: 1060, y1: 620 };
const CHIP = { largura: 180, altura: 60, folga: 32, y0: 780, contagem: 5 };
const CHIP_INICIO_X = (LARGURA - (CHIP.largura * CHIP.contagem + CHIP.folga * (CHIP.contagem - 1))) / 2;

function dentro(x, y, caixa) {
	return x >= caixa.x0 && x < caixa.x1 && y >= caixa.y0 && y < caixa.y1;
}

function bordaDoCartao(x, y) {
	const espessura = 1;
	const noXBorda = x < CARTAO.x0 + espessura || x >= CARTAO.x1 - espessura;
	const noYBorda = y < CARTAO.y0 + espessura || y >= CARTAO.y1 - espessura;
	return dentro(x, y, CARTAO) && (noXBorda || noYBorda);
}

function chipDoRodape(x, y) {
	if (y < CHIP.y0 || y >= CHIP.y0 + CHIP.altura) return null;
	for (let i = 0; i < CHIP.contagem; i += 1) {
		const inicio = CHIP_INICIO_X + i * (CHIP.largura + CHIP.folga);
		if (x >= inicio && x < inicio + CHIP.largura) return CORES.acentos[i];
	}
	return null;
}

/** Retorna a cor do pixel — cabeçalho creme, cartão de artigo, chips de editoria no rodapé. */
function corDoPixel(x, y) {
	// Cabeçalho: creme, com fio de borda no fim e a marca (mascote + palavra)
	// à esquerda — dois blocos escuros simulando o lockup do tema.
	if (y < HEADER_ALTURA) {
		if (y >= HEADER_ALTURA - 2) return CORES.contrast3;
		if (x >= 40 && x < 90 && y >= 24 && y < 72) return CORES.contrast;
		if (x >= 104 && x < 264 && y >= 40 && y < 56) return CORES.contrast2;
		return CORES.superficie;
	}

	if (bordaDoCartao(x, y)) return CORES.contrast3;

	if (dentro(x, y, CARTAO)) {
		// Título do cartão.
		if (x > 180 && x < 820 && y > 200 && y < 256) return CORES.contrast;
		// Fio abaixo do título.
		if (x > 180 && x < 1020 && y > 280 && y < 282) return CORES.contrast3;
		// Linhas de texto sugeridas geometricamente.
		if (x > 180 && x < 980 && y > 320 && y < 338) return CORES.contrast2;
		if (x > 180 && x < 900 && y > 360 && y < 378) return CORES.contrast2;
		if (x > 180 && x < 760 && y > 400 && y < 418) return CORES.contrast2;
		// Selo de categoria.
		if (x > 180 && x < 340 && y > 460 && y < 500) return CORES.acentos[1];
		return CORES.superficie;
	}

	const chip = chipDoRodape(x, y);
	if (chip) return chip;

	return CORES.base;
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
