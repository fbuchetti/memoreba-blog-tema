<?php
/**
 * Funções do tema-filho Memoreba Blog.
 *
 * Atenção (Handbook de temas do WordPress): este arquivo NÃO substitui o
 * functions.php do tema-pai — os dois carregam, o filho primeiro. Nunca copie
 * código do pai para cá: nome de função repetido derruba o site.
 *
 * @package memoreba-blog
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Garante que o style.css do tema-filho seja carregado.
 *
 * Em tema de blocos o WordPress costuma cuidar disso sozinho, mas o Handbook
 * é explícito: o comportamento depende do tema-pai. Enfileirar aqui é barato e
 * remove a dúvida — se o núcleo já tiver carregado o arquivo com este mesmo
 * identificador, a chamada é ignorada.
 */
function memoreba_blog_enfileirar_estilos(): void {
	wp_enqueue_style(
		'memoreba-blog',
		get_stylesheet_uri(),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'memoreba_blog_enfileirar_estilos' );
