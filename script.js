/* ==========================================================
   João Victor Scaboli — portfólio
   1. Menu do celular
   2. Destaque do link da seção atual
   3. Fade in ao rolar a página
   4. Formulário de contato (abre WhatsApp ou e-mail)
   5. Ano do rodapé
   ========================================================== */

// Dados de contato: para trocar número ou e-mail, altere só aqui
// (e nos links wa.me / mailto do index.html).
const WHATSAPP_NUMERO = '5519999126156'; // 55 (Brasil) + DDD + número, só dígitos
const EMAIL_CONTATO = 'scabolij@gmail.com';

// Avisa o CSS de que o JavaScript está ativo (libera menu do celular e fade in)
document.documentElement.classList.add('js');

/* ---------- 1. Menu do celular ---------- */
const botaoMenu = document.querySelector('.nav-toggle');
const menu = document.querySelector('.site-nav');
const linksMenu = document.querySelectorAll('.nav-link');

function definirMenu(aberto) {
  menu.classList.toggle('is-open', aberto);
  botaoMenu.setAttribute('aria-expanded', String(aberto));
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

botaoMenu.addEventListener('click', () => {
  definirMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
});

// Fecha o menu ao escolher um link. A rolagem suave em si é feita pelo CSS
// (scroll-behavior: smooth no <html>), então não precisa de código aqui.
linksMenu.forEach((link) => {
  link.addEventListener('click', () => definirMenu(false));
});

// Fecha o menu com a tecla Esc
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && menu.classList.contains('is-open')) {
    definirMenu(false);
    botaoMenu.focus();
  }
});

/* ---------- 2. Destaque do link da seção atual ---------- */
const secoes = document.querySelectorAll('main section[id]');

if ('IntersectionObserver' in window) {
  const observadorSecoes = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        linksMenu.forEach((link) => {
          const ativo = link.getAttribute('href') === `#${entrada.target.id}`;
          link.classList.toggle('is-active', ativo);
          if (ativo) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    },
    // A seção "ativa" é a que cruza a faixa central da tela
    { rootMargin: '-45% 0px -50% 0px' }
  );

  secoes.forEach((secao) => observadorSecoes.observe(secao));
}

/* ---------- 3. Fade in ao rolar ---------- */
const elementosReveal = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observadorReveal = new IntersectionObserver(
    (entradas, observador) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visible');
        observador.unobserve(entrada.target); // anima só uma vez
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elementosReveal.forEach((el) => observadorReveal.observe(el));
} else {
  // Navegador antigo: mostra tudo de uma vez
  elementosReveal.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- 4. Formulário de contato ---------- */
// O GitHub Pages não roda código de servidor, então o formulário não "envia"
// sozinho. Em vez disso, ele monta a mensagem e abre o WhatsApp ou o
// aplicativo de e-mail do visitante com tudo já preenchido.
const formulario = document.getElementById('form-contato');
const statusForm = document.getElementById('form-status');

const campos = {
  nome: document.getElementById('nome'),
  email: document.getElementById('email'),
  tipo: document.getElementById('tipo'),
  mensagem: document.getElementById('mensagem'),
};

function mostrarErro(campo, texto) {
  const erro = document.getElementById(`erro-${campo.id}`);
  erro.textContent = texto;
  erro.hidden = false;
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', erro.id);
}

function limparErro(campo) {
  const erro = document.getElementById(`erro-${campo.id}`);
  if (!erro) return;
  erro.hidden = true;
  erro.textContent = '';
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
}

function validar() {
  let primeiroInvalido = null;
  const marcar = (campo, texto) => {
    mostrarErro(campo, texto);
    primeiroInvalido = primeiroInvalido || campo;
  };

  [campos.nome, campos.email, campos.mensagem].forEach(limparErro);

  if (campos.nome.value.trim().length < 2) {
    marcar(campos.nome, 'Escreva o seu nome para eu saber com quem estou falando.');
  }

  const email = campos.email.value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    marcar(campos.email, 'Esse e-mail parece incompleto. Confira se tem @ e o final, como .com.');
  }

  if (campos.mensagem.value.trim().length < 10) {
    marcar(campos.mensagem, 'Conte em uma ou duas frases o que você precisa.');
  }

  if (primeiroInvalido) primeiroInvalido.focus();
  return !primeiroInvalido;
}

function montarMensagem() {
  const nome = campos.nome.value.trim();
  const email = campos.email.value.trim();
  const linhas = [
    `Olá, João! Meu nome é ${nome} e gostaria de um orçamento para um site.`,
    '',
    `Tipo de site: ${campos.tipo.value}`,
    '',
    campos.mensagem.value.trim(),
  ];
  if (email) linhas.push('', `Meu e-mail: ${email}`);
  return linhas.join('\n');
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  statusForm.textContent = '';

  if (!validar()) return;

  // Descobre qual dos dois botões foi clicado (WhatsApp é o padrão)
  const canal = evento.submitter?.dataset.canal || 'whatsapp';
  const texto = montarMensagem();

  if (canal === 'email') {
    const assunto = `Orçamento de site: ${campos.tipo.value}`;
    window.location.href =
      `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
    statusForm.textContent = 'Seu aplicativo de e-mail foi aberto com a mensagem pronta. Falta só enviar por lá.';
  } else {
    window.open(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`,
      '_blank',
      'noopener'
    );
    statusForm.textContent = 'O WhatsApp foi aberto com a mensagem pronta. Falta só enviar por lá.';
  }
});

// Some com o erro assim que a pessoa volta a digitar no campo
[campos.nome, campos.email, campos.mensagem].forEach((campo) => {
  campo.addEventListener('input', () => limparErro(campo));
});

/* ---------- 5. Ano do rodapé ---------- */
document.getElementById('ano').textContent = new Date().getFullYear();
