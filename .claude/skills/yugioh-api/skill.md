# Yu-Gi-Oh! API — Guia de Implementação

## Visão Geral

A **Yu-Gi-Oh! API** (fornecida pelo YGOPRODeck) oferece acesso a informações detalhadas sobre cartas do jogo de cartas colecionáveis Yu-Gi-Oh!, incluindo cartas do tipo Monster, Spell e Trap. É possível consultar nomes, tipos, atributos, ATK, DEF, níveis, raças, preços e muito mais.

| Propriedade      | Valor                               |
| ---------------- | ----------------------------------- |
| **Base URL**     | `https://db.ygoprodeck.com/api/v7/` |
| **Autenticação** | Não requerida (pública)             |
| **HTTPS**        | Sim                                 |
| **CORS**         | Não                                 |
| **Formato**      | JSON                                |

---

## Base URL

https://db.ygoprodeck.com/api/v7/

---

## Autenticação

Nenhuma autenticação (API Key ou token) é necessária para consumir esta API. As requisições podem ser feitas diretamente sem cabeçalhos de autorização.

---

## Endpoints

### 1. Buscar Cartas (`cardinfo.php`)

Endpoint principal para consulta de cartas. Aceita múltiplos parâmetros de filtro via query string.
