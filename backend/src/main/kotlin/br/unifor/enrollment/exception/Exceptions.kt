package br.unifor.enrollment.exception

class EntidadeNaoEncontradaException(message: String) : RuntimeException(message)

class RegraDeNegocioException(message: String) : RuntimeException(message)

class AcessoNegadoException(message: String) : RuntimeException(message)
