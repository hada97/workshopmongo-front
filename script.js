const SERVER_URL = "http://localhost:8080";
//const SERVER_URL = "http://localhost:8080";

// Função para enviar um novo post (Create)
document.getElementById("createPostForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita o comportamento padrão do formulário

    // Pegando os valores dos campos
    const title = document.getElementById("postTitle").value;
    const body = document.getElementById("postContent").value;
    const authorName = document.getElementById("authorName").value;
    const authorId = document.getElementById("authorId").value;

    // Valida se os campos obrigatórios estão preenchidos
    if (!title || !body || !authorName || !authorId) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // Criando o objeto do post
    const postData = {
        title: title,
        body: body,
        author: {
            id: authorId,
            name: authorName
        }
    };

    try {
        // Enviando o post para o backend
        const response = await fetch(SERVER_URL + "/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData) // Envia os dados como JSON
        });

        // Verifica se a resposta é bem-sucedida
        if (response.ok) {
            alert("Post criado com sucesso!");
            fetchPosts();  // Atualiza a lista de posts
            document.getElementById("createPostForm").reset();  // Limpa o formulário após o envio
        } else {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                alert("Erro: " + (data.message || "Erro ao criar o post."));
            } else {
                const text = await response.text();
                alert("Erro desconhecido: " + text);
            }
        }
    } catch (error) {
        alert("Ocorreu um erro ao tentar criar o post: " + error.message);
    }
});


// Função para criar um novo usuário
document.getElementById("createUserForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    const userData = { name, email };

    try {
        const response = await fetch(SERVER_URL + "/users", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            alert("Usuário criado com sucesso!");
            fetchUsers();  // Atualiza a lista de usuários
            document.getElementById("createUserForm").reset();  // Limpa o formulário após o envio
        } else {
            await handleErrorResponse(response);
        }
    } catch (error) {
        alert("Ocorreu um erro ao tentar criar o usuário: " + error.message);
    }
});


// Função para buscar posts do servidor (Read)
function fetchPosts() {
  const loadingStatus = document.getElementById('loadingStatus');
  loadingStatus.classList.add('show');

  fetch(SERVER_URL + '/posts')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return response.json();
    })
    .then(posts => {
      const postsList = document.getElementById('postsList');
      postsList.innerHTML = ''; // Limpa a lista de posts

      posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');

        // Formatar a data e hora sem os segundos
        const postDate = new Date(post.dateTime);
        const postFormattedDate = postDate.toLocaleDateString() + ' ' + postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        postItem.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.body}</p>
          <p>${post.author.name}</p>
          <p>${postFormattedDate}</p>
        `;

        if (post.comments && post.comments.length > 0) {
          const commentsSection = document.createElement('div');
          commentsSection.classList.add('comments-section');

          post.comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            // Formatar a data do comentário
            const commentDate = new Date(comment.date);
            const commentFormattedDate = commentDate.toLocaleDateString() + ' ' + commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            commentItem.innerHTML = `
              <p><strong>${comment.author.name || 'Anônimo'}:</strong> ${comment.text}</p>
              <p><small>${commentFormattedDate}</small></p>
            `;
            commentsSection.appendChild(commentItem);
          });

          postItem.appendChild(commentsSection);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');
        actionsDiv.innerHTML = `
          <button onclick="editPost('${post.id}')">Editar</button>
          <button onclick="deletePost('${post.id}')">Excluir</button>
        `;
        postItem.appendChild(actionsDiv);

        postsList.appendChild(postItem);
      });

      loadingStatus.classList.remove('show');
    })
    .catch(error => {
      console.error('Erro ao carregar os posts:', error);
      loadingStatus.innerText = 'Erro ao carregar os posts.';
    });
}


// Função para buscar usuários do servidor (Read)
function fetchUsers() {
  const loading = document.getElementById('loading');
  loading.classList.add('show');

  fetch(SERVER_URL + "/users")
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return response.json();
    })
    .then(users => {
      const userList = document.getElementById('userList');
      userList.innerHTML = ''; // Limpa a lista de usuários

      users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');

        userItem.innerHTML = `
          <h3>${user.name}</h3>
          <p>${user.email}</p>
          <p>ID: ${user.id}</p>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');
        actionsDiv.innerHTML = `
          <button onclick="editUser(${user.id})">Editar</button>
          <button onclick="deleteUser('${user.id}')">Excluir</button>
        `;
        userItem.appendChild(actionsDiv);

        userList.appendChild(userItem);
      });

      loading.classList.remove('show');
    })
    .catch(error => {
      console.error('Erro ao carregar os usuários:', error);
      loading.innerText = 'Erro ao carregar os usuários.';
    });
}


// Função para deletar um post (Delete)
async function deletePost(postId) {
  console.log('Tentando excluir o post com ID:', postId);

  if (!postId) {
    console.error('ID inválido!');
    return; // Aborta a execução se o ID for inválido
  }

  // Confirmação antes de excluir
  if (confirm('Você tem certeza que deseja excluir este post?')) {
    try {
      const response = await fetch(SERVER_URL + `/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o post');
      }

      alert('Post excluído com sucesso!');
      fetchPosts();  // Recarregar a lista de posts após a exclusão

    } catch (error) {
      console.error('Erro ao excluir o post:', error);
    }
  }
}

// Função para deletar um usuário (Delete)
async function deleteUser(userId) {
  console.log('Tentando excluir o usuário com ID:', userId);

  if (!userId) {
    console.error('ID inválido!');
    return;
  }

  if (confirm('Você tem certeza que deseja excluir este usuário?')) {
    try {
      const response = await fetch(SERVER_URL + `/users/${userId}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Erro ao excluir o usuário');
      }

      alert('Usuário excluído com sucesso!');
      fetchUsers(); // Recarregar a lista de usuários após a exclusão
    } catch (error) {
      console.error('Erro ao excluir o usuário:', error);
    }
  }
}



document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os botões de alternância e os formulários
    const togglePostFormButton = document.getElementById('togglePostFormButton');
    const createPostForm = document.getElementById('createPostForm');

    const toggleUserFormButton = document.getElementById('toggleUserFormButton');
    const createUserForm = document.getElementById('createUserForm');

    // Função para alternar a visibilidade do formulário de postagem
    togglePostFormButton.addEventListener('click', () => {
        if (createPostForm.style.display === 'none' || createPostForm.style.display === '') {
            createPostForm.style.display = 'block'; // Exibe o formulário
        } else {
            createPostForm.style.display = 'none'; // Esconde o formulário
        }
    });

    // Função para alternar a visibilidade do formulário de cadastro de usuário
    toggleUserFormButton.addEventListener('click', () => {
        if (createUserForm.style.display === 'none' || createUserForm.style.display === '') {
            createUserForm.style.display = 'block'; // Exibe o formulário
        } else {
            createUserForm.style.display = 'none'; // Esconde o formulário
        }
    });
});


// Chama a função pela primeira vez quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();  // Carrega os posts
  fetchUsers();  // Carrega os usuários
  setInterval(fetchPosts, 10000); // Atualiza os posts a cada 10 segundos
  setInterval(fetchUsers, 10000); // Atualiza os usuários a cada 10 segundos
});
