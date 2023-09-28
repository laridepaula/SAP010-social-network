import {
  createPost,
  listAllPosts,
  editPost,
  deletePost,
  likePost,
  deslikePost,
  checkLikedPosts,
  calculateTimeAgo,
} from '../../firebase/firebase';
import './feed.css';
import header from '../header/header.js';
import likeIcon from '../../images/like-icon.svg';
import likeIconColorful from '../../images/like-icon-colorful.svg';
import saveIcon from '../../images/save-icon.svg';
import cancelIcon from '../../images/cancel-icon.svg';
import editIcon from '../../images/edit-icon.svg';
import deleteIcon from '../../images/delete-icon.svg';

export default (user) => {
  const container = document.createElement('div');
  container.classList.add('container-pai');
  container.appendChild(header());
  const containerFeed = document.createElement('section');
  containerFeed.classList.add('container-feed');
  const templateFeed = `
    <main class="main">
      <div class="feed">
        <div class="container-input-post">
          <div class="header-feed">
            <img src="${user.photoURL}" class="user-picture-feed" alt="user-picture">
            <span>${user.displayName}</span>
          </div>
          <textarea id="user-text-area" placeholder="O que está jogando?" maxlength="700"></textarea>
          <div class="div-btn-publish">
            <button class="btn-publish">Publicar</button>
          </div>     
        </div>
      </div>
    </main>
    `;
  containerFeed.innerHTML = templateFeed;
  container.appendChild(containerFeed);

  const feedMain = containerFeed.querySelector('.feed');
  const btnPublish = containerFeed.querySelector('.btn-publish');

  const postsList = document.createElement('section');
  postsList.classList.add('section-posts');

  const showPosts = async (post) => {
    const likedPost = await checkLikedPosts(post.docRef, user.uid);
    const likeIconSrc = likedPost ? likeIconColorful : likeIcon;
    const feed = `
    <div class="post-container">
      <div class="post-header">
        <img src="${post.photoURL}" class="user-picture" alt="user-picture">
        <span>${post.user}</span>
        <div class="post-date">${calculateTimeAgo(post.dateTime.toDate())}</div>
      </div>
      <textarea id="${post.docRef}" class="post-content" disabled>${post.content}</textarea>
      <div class="post-info">
        <div class="post-likes">
          <img class="like-icon" src="${likeIconSrc}" alt="Like" data-unliked="${likeIcon}" data-liked="${likeIconColorful}">
          <span class="like-count">${post.likes}</span>
        </div>
        <div class="post-actions">
          <div class="edit-btn p${post.id}" style="display: none;">
            <img src="${editIcon}" alt="Editar" class="edit">
          </div>
          <div class="delete-btn p${post.id}" style="display: none;">
            <img id="${post.docRef}" src="${deleteIcon}" alt="Excluir" class="delete">
          </div>
        </div>
      </div>
    </div>
    `;
    postsList.innerHTML += feed;
    feedMain.appendChild(postsList);

    const txts = postsList.querySelectorAll('.post-content');

    txts.forEach((txt) => {
      const sizeHeight = txt.scrollHeight;
      txt.style.height = `${sizeHeight}px`;
      txt.addEventListener('input', function () {
        this.style.height = `${sizeHeight}px`;
      });
    });

    const btns = postsList.querySelectorAll(`.p${post.id}`);
    const btnsDelete = postsList.querySelectorAll('.delete');
    const btnsEdit = postsList.querySelectorAll('.edit');

    if (user.uid === post.id) {
      btns.forEach((btn) => {
        btn.style.display = 'block';
      });
    }

    btnsDelete.forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const isItToDelete = window.confirm('Deseja mesmo excluir o post?');
        if (isItToDelete) {
          const id = event.target.id;
          await deletePost(id);
          listAllPosts().then((posts) => {
            postsList.innerHTML = '';
            posts.forEach((publish) => {
              showPosts(publish);
            });
          });
        }
      });
    });

    btnsEdit.forEach((btn) => {
      btn.addEventListener('click', () => {
        const divBtn = btn.parentNode;
        const postActions = divBtn.parentNode;
        const postInfo = postActions.parentNode;
        const postContainer = postInfo.parentNode;
        const postContent = postContainer.querySelector('.post-content');
        postContent.removeAttribute('disabled');
        postContent.tabindex = '0';
        postContent.focus();
        const btnSave = document.createElement('button');
        btnSave.classList.add('save-btn');
        btnSave.style.backgroundImage = `url(${saveIcon})`;
        btnSave.textContent = '';
        const btnCancel = document.createElement('button');
        btnCancel.classList.add('cancel-btn');
        btnCancel.style.backgroundImage = `url(${cancelIcon})`;
        btnCancel.textContent = '';
        postActions.appendChild(btnSave);
        postActions.appendChild(btnCancel);
        const del = postActions.querySelector('.delete-btn');
        const edt = postActions.querySelector('.edit-btn');
        edt.style.display = 'none';
        del.style.display = 'none';
        const snapshot = postContent.value;
        console.log(snapshot);
        btnSave.addEventListener('click', async () => {
          await editPost(postContent.id, postContent.value);
          postContent.setAttribute('disabled', true);
          postActions.removeChild(btnSave);
          postActions.removeChild(btnCancel);
          edt.style.display = 'block';
          del.style.display = 'block';
        });
        btnCancel.addEventListener('click', async () => {
          postContent.value = snapshot;
          postContent.setAttribute('disabled', true);
          postActions.removeChild(btnSave);
          postActions.removeChild(btnCancel);
          edt.style.display = 'block';
          del.style.display = 'block';
        });
      });
    });

    const btnLike = postsList.querySelectorAll('.like-icon');
    btnLike.forEach((atualLike) => {
      atualLike.addEventListener('click', async () => {
        const postContainer = atualLike.closest('.post-container');
        const postDocRef = postContainer.querySelector('.post-content').id;
        const allPosts = await listAllPosts();
        const atualPost = allPosts.find((p) => p.docRef === postDocRef);
        if (!atualPost) return;
        let isLiked = atualPost.likeBy && atualPost.likeBy.includes(user.uid);
        let count = atualPost.likes || 0;
        const likeCount = atualLike.nextElementSibling;
        if (isLiked) {
          atualLike.src = atualLike.dataset.unliked;
          count -= 1;
          await deslikePost(atualPost.docRef, user.uid);
          atualLike.classList.remove('like-icon-colorful');
        } else {
          atualLike.src = atualLike.dataset.liked;
          count += 1;
          await likePost(atualPost.docRef, user.uid);
          atualLike.classList.add('like-icon-colorful');
        }
        likeCount.textContent = count;
        isLiked = !isLiked;
      });
    });
  };

  btnPublish.addEventListener('click', async () => {
    const post = containerFeed.querySelector('#user-text-area');
    const postInput = post.value;
    if (postInput.length > 0) {
      await createPost(postInput, user);
      post.value = '';
      listAllPosts().then((posts) => {
        postsList.innerHTML = '';
        posts.forEach((publish) => {
          showPosts(publish);
        });
      });
    } else {
      alert('Não pode publicar um post vazio!');
    }
  });

  listAllPosts().then((posts) => {
    posts.forEach((post) => {
      showPosts(post);
    });
  });

  return container;
};
