// Definindo a URL base como uma variável
const baseURL = "https://workshop2-euctepgkf7hnc5fm.canadacentral-01.azurewebsites.net/";

// Função para enviar um novo post (Create)
document
  .getElementById("createPostForm")
  .addEventListener("submit", async function (event) {
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
        name: authorName,
      },
    };

    try {
      // Enviando o post para o backend
      const response = await fetch(`${baseURL}posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData), // Envia os dados como JSON
      });

      // Verifica se a resposta é bem-sucedida
      if (response.ok) {
        alert("Post criado com sucesso!");
        fetchPosts(); // Atualiza a lista de posts
        document.getElementById("createPostForm").reset(); // Limpa o formulário após o envio
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
document
  .getElementById("createUserForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;

    const userData = { name, email };

    try {
      const response = await fetch(`${baseURL}users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert("Usuário criado com sucesso!");
        fetchUsers(); // Atualiza a lista de usuários
        document.getElementById("createUserForm").reset(); // Limpa o formulário após o envio
      } else {
        await handleErrorResponse(response);
      }
    } catch (error) {
      alert("Ocorreu um erro ao tentar criar o usuário: " + error.message);
    }
  });

// Função para buscar posts do servidor (Read)
function fetchPosts() {
  const loadingStatus = document.getElementById("loadingStatus");
  loadingStatus.classList.add("show");

  fetch(`${baseURL}posts`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro na requisição");
      }
      return response.json();
    })
    .then((posts) => {
      const postsList = document.getElementById("postsList");
      postsList.innerHTML = ""; // Limpa a lista de posts

      posts.forEach((post) => {
        const postItem = document.createElement("div");
        postItem.classList.add("post-item");

        // Formatar a data e hora sem os segundos
        const postDate = new Date(post.dateTime);
        const postFormattedDate =
          postDate.toLocaleDateString() +
          " " +
          postDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

        postItem.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.body}</p>
          <p>${post.author.name}</p>
          <p>${postFormattedDate}</p>
        `;

        if (post.comments && post.comments.length > 0) {
          const commentsSection = document.createElement("div");
          commentsSection.classList.add("comments-section");

          post.comments.forEach((comment) => {
            const commentItem = document.createElement("div");
            commentItem.classList.add("comment-item");

            // Formatar a data do comentário
            const commentDate = new Date(comment.date);
            const commentFormattedDate =
              commentDate.toLocaleDateString() +
              " " +
              commentDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

            commentItem.innerHTML = `
              <p><strong>${comment.author.name || "Anônimo"}:</strong> ${
              comment.text
            }</p>
              <p><small>${commentFormattedDate}</small></p>
            `;
            commentsSection.appendChild(commentItem);
          });

          postItem.appendChild(commentsSection);
        }

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("actions");
        actionsDiv.innerHTML = `
          <button onclick="editPost('${post.id}')">Editar</button>
          <button onclick="deletePost('${post.id}')">Excluir</button>
        `;
        postItem.appendChild(actionsDiv);

        postsList.appendChild(postItem);
      });

      loadingStatus.classList.remove("show");
    })
    .catch((error) => {
      console.error("Erro ao carregar os posts:", error);
      loadingStatus.innerText = "Erro ao carregar os posts.";
    });
}

// Função para buscar usuários do servidor (Read)
function fetchUsers() {
  const loading = document.getElementById("loading");
  loading.classList.add("show");

  fetch(`${baseURL}users`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro na requisição");
      }
      return response.json();
    })
    .then((users) => {
      const userList = document.getElementById("userList");
      userList.innerHTML = ""; // Limpa a lista de usuários

      users.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.classList.add("user-item");

        userItem.innerHTML = `
          <p>${user.name} (${user.email})</p>
        `;

        userList.appendChild(userItem);
      });

      loading.classList.remove("show");
    })
    .catch((error) => {
      console.error("Erro ao carregar os usuários:", error);
      loading.innerText = "Erro ao carregar os usuários.";
    });
}
