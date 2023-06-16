import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  setDoc, doc, deleteDoc, updateDoc,
} from 'firebase/firestore';

import {
  signInWithGoogle,
  signInWithGitHub,
  logIn,
  logOut,
  registerUserWithAnotherProvider,
  registerUser,
  isUserLoggedIn,
  deletePost,
  editPost,
} from '../src/firebase/firebase.js';

const mockAuth = {
  currentUser: {
    displayName: 'Spock',
    email: 'spock@gmail.com',
    uid: '3141592',
    password: 'Senha@123',
  },
};

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

beforeAll(() => {
  jest.clearAllMocks();
});

describe('signInWithGoogle', () => {
  it('deveria ser uma função', () => {
    expect(typeof signInWithGoogle).toBe('function');
  });

  it('Deveria logar o usuário com a conta do google', async () => {
    signInWithPopup.mockResolvedValueOnce();
    await signInWithGoogle();
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
  });
});

describe('signInWithGitHub', () => {
  it('deveria ser uma função', () => {
    expect(typeof signInWithGitHub).toBe('function');
  });

  it('Deveria logar o usuário com a conta do GitHub', async () => {
    signInWithPopup.mockResolvedValueOnce();
    await signInWithGitHub();
    expect(signInWithPopup).toHaveBeenCalledTimes(2);
  });
});

describe('isUserLoggedIn', () => {
  it('deve verificar se o usuário logado está autenticado', () => {
    isUserLoggedIn();
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
  });
});

describe('logIn', () => {
  it('Deveria logar com email e senha corretos', async () => {
    const email = 'spock@gmail.com';
    const password = '3141592';
    signInWithEmailAndPassword.mockResolvedValueOnce();
    await logIn(email, password);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
  });

  it('Deveria mostrar um erro e falhar ao logar o usuario', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Erro ao logar usuário'));
    try {
      await logIn();
    } catch (e) {
      expect(e.message).toEqual('Erro ao logar usuário');
    }
  });
});

describe('logOut', () => {
  it('Deveria deslogar', async () => {
    await logOut();
    expect(signOut).toHaveBeenCalled();
  });
});

describe('registerUserWithAnotherProvider', () => {
  it('Deveria cadastrar um usuário com provedor do Google ou Github', async () => {
    await registerUserWithAnotherProvider();
    expect(setDoc).toHaveBeenCalled();
    expect(doc).toHaveBeenCalled();
  });
  it('Deveria capturar um erro e falhar ao cadastrar um usuário com provedor do Google ou Github', async () => {
    setDoc.mockRejectedValueOnce(new Error('Erro ao cadastrar usuário'));
    try {
      await registerUserWithAnotherProvider();
    } catch (e) {
      expect(e.message).toEqual('Erro ao cadastrar usuário');
    }
  });
});

describe('registerUser', () => {
  it('Deveria cadastrar um usuário com o formulário', async () => {
    const user = mockAuth.currentUser;
    await registerUser(user.displayName, user.displayName, user.email, user.password);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, user.email, user.password);
    expect(setDoc).toHaveBeenCalledTimes(2);
    expect(doc).toHaveBeenCalled();
  });
});

describe('deletePost', () => {
  it('Deveria deletar o post do usuario', () => {
    deletePost();
    expect(deleteDoc).toHaveBeenCalled();
    expect(doc).toHaveBeenCalled();
  });
});

describe('editPost', () => {
  it('Deveria atualizar o post do usuario', () => {
    editPost();
    expect(updateDoc).toHaveBeenCalled();
    expect(doc).toHaveBeenCalled();
  });
});
/* describe('listAllPosts', () => {
  it('Deveria listar todos os posts no feed', async () => {
    const snapshot = getDocs();
    await listAllPosts();
    expect(collection).toHaveBeenCalled();
    expect(orderBy).toHaveBeenCalled();
    expect(query).toHaveBeenCalled();
    expect(snapshot).toHaveBeenCalled();
  });
}); */
