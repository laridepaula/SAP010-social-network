import './login.css';
import meninaLogin from '../../images/login.svg';
import googleImg from '../../images/google.svg';
import githubImg from '../../images/github-mobile.svg';
import {
  logIn,
  signInWithGoogle,
  signInWithGitHub,
  auth,
  registerUserWithAnotherProvider,
} from '../../firebase/firebase.js';

export default () => {
  const userLogin = document.createElement('section');
  userLogin.classList.add('container-login');
  const templateLogin = `
    <div class="container-img-entrar">
      <img class="img-menina-login" src=${meninaLogin} alt="login-animation">
      <h1 class="text-mobile-version">ENTRAR</h1>
    </div>
    <div class="form-login">
      <h1 class="text-desktop-version">ENTRAR</h1>
      <form>
        <input type="email" class="input-email-login" placeholder="E-MAIL" required>
        <span id="email-alert" class="input-error"></span>
        <div class="container-pass-checkbox">
          <input type="password" class="input-pass-login" placeholder="SENHA" required>
          <input type="checkbox" id="password-checkbox">
          <label for="password-checkbox" class="btn-checkbox"></label>
        </div>
        <span id="pass-alert" class="input-error"></span>
        <span id="user-alert" class="input-error"></span>
        <a class="btn-entrar" href="/#feed">Entrar</a>
      </form>
      <p>ou continue com</p>
      <picture class="login-icons">
        <img class="btn-google" src=${googleImg} alt="google icon">
        <img class="btn-github" src=${githubImg} alt="github icon">
      </picture>
      <p class="dont-have-an-account">Não possui uma conta?<a class="create-account" href="/#register">Criar conta agora</a></p>
    </div>
  `;
  userLogin.innerHTML = templateLogin;

  const emailInput = userLogin.querySelector('.input-email-login');
  const passInput = userLogin.querySelector('.input-pass-login');
  const btnLogin = userLogin.querySelector('.btn-entrar');
  const loginGoogle = userLogin.querySelector('.btn-google');
  const loginGitHub = userLogin.querySelector('.btn-github');

  const emailAlert = userLogin.querySelector('#email-alert');
  const passAlert = userLogin.querySelector('#pass-alert');
  const userAlert = userLogin.querySelector('#user-alert');

  const passCheckbox = userLogin.querySelector('#password-checkbox');
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/~]).{6,}$/;

  function validateEmail() {
    const emailErrorInputValue = emailInput.value;
    if (!emailErrorInputValue) {
      emailAlert.textContent = 'Insira um e-mail válido';
    }
  }

  function validatePassword() {
    const passInputValue = passInput.value;
    if (!passInputValue) {
      passAlert.textContent = 'Senha inválida';
    }
  }

  emailInput.addEventListener('input', () => {
    emailAlert.textContent = '';
  });

  passInput.addEventListener('input', () => {
    passAlert.textContent = '';
  });

  passCheckbox.addEventListener('change', () => {
    if (passCheckbox.checked) {
      passInput.type = 'text';
    } else {
      passInput.type = 'password';
    }
  });

  btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passInput.value;

    if (email !== '') {
      emailAlert.textContent = '';
    } else {
      validateEmail();
    }
    if (password !== '' && strongPassword.test(password)) {
      passAlert.textContent = '';
    } else {
      validatePassword();
    }

    try {
      await logIn(email, password);
      if (auth.currentUser) {
        window.location.href = '#feed';
      }
    } catch (error) {
      userAlert.textContent = error.message;
    }
  });

  loginGoogle.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
      console.log(typeof signInWithGoogle);
      const uid = auth.currentUser.uid;
      const name = auth.currentUser.displayName;
      const email = auth.currentUser.email;
      const photoURL = auth.currentUser.photoURL;
      await registerUserWithAnotherProvider(uid, name, name, email, photoURL);
      if (auth.currentUser) {
        window.location.href = '#feed';
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  loginGitHub.addEventListener('click', async () => {
    try {
      await signInWithGitHub();
      const uid = auth.currentUser.uid;
      const name = auth.currentUser.displayName;
      const email = auth.currentUser.email;
      const photoURL = auth.currentUser.photoURL;
      await registerUserWithAnotherProvider(uid, name, name, email, photoURL);
      if (auth.currentUser) {
        window.location.href = '#feed';
      }
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('Usuário já cadastrado com provedor do Google');
      } else {
        console.log(error.message);
      }
    }
  });

  return userLogin;
};
