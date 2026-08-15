/* Shared blog data helpers — backed by the AutonauticsBlog.API service.
   Used by /admin/blog/ (author, Quill-based rich-text editor) and /company/knowledge-center/
   (public listing + post pages). Post content is stored as HTML from the Quill editor.
   NOTE: the API currently only has a LAN address (no public host yet), so this only
   works from machines on the same network as the API server. */
window.AnstelBlog = (function () {
  var API_BASE = 'http://192.168.4.9:9814';
  var TOKEN_KEY = 'anstel_admin_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }
  function isLoggedIn() { return !!getToken(); }

  function authHeaders() {
    var t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  async function login(username, password) {
    var res = await fetch(API_BASE + '/api/Account/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    });
    if (!res.ok) return null;
    var data = await res.json();
    setToken(data.token);
    return data;
  }

  function logout() {
    clearToken();
  }

  /* Categories are a real, shared resource on the API now. Cached per page-load
     since they rarely change and every post-list render needs to resolve names. */
  var categoriesCache = null;

  async function getCategories() {
    if (categoriesCache) return categoriesCache;
    var res = await fetch(API_BASE + '/api/Category/GetAllCategories');
    if (!res.ok) return [];
    categoriesCache = await res.json();
    return categoriesCache;
  }

  /* Throws Error('UNAUTHORIZED') if the session token is missing/expired. */
  async function createCategory(name) {
    var res = await fetch(API_BASE + '/api/Category/Create', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ name: name })
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('SAVE_FAILED');
    var created = await res.json();
    categoriesCache = null; // force a fresh fetch next time so the new category shows up everywhere
    return created;
  }

  /* The API stores posts with different field names (thumbnailUrl/isPublished/categoryId)
     than the app's shape (coverImage/status/category name) — normalize once here so the
     rest of the app only ever deals with one shape. `categoryMap` is {id: name}. */
  function normalizePost(p, categoryMap) {
    var cover = p.thumbnailUrl;
    if (!cover || cover === 'null') cover = '';
    return {
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      categoryId: p.categoryId || null,
      category: (p.categoryId && categoryMap && categoryMap[p.categoryId]) || '',
      content: p.content || '',
      author: p.author || '',
      coverImage: cover,
      status: p.isPublished ? 'published' : 'draft',
      updatedAt: new Date(p.updatedAt || p.createdAt || Date.now()).getTime()
    };
  }

  async function categoryMap() {
    var cats = await getCategories();
    var map = {};
    cats.forEach(function (c) { map[c.id] = c.name; });
    return map;
  }

  async function getPosts() {
    var res = await fetch(API_BASE + '/api/Blog/GetAll');
    if (!res.ok) return [];
    var posts = await res.json();
    var map = await categoryMap();
    return posts.map(function (p) { return normalizePost(p, map); });
  }

  async function getPost(slug) {
    var res = await fetch(API_BASE + '/api/Blog/GetBySlug?slug=' + encodeURIComponent(slug));
    if (!res.ok) return null;
    var p = await res.json();
    if (!p || !p.id) return null;
    var map = await categoryMap();
    return normalizePost(p, map);
  }

  /* Other published posts in the same category — used for the "Suggested Posts" section. */
  async function getPostsByCategory(categoryId) {
    if (!categoryId) return [];
    var res = await fetch(API_BASE + '/api/Blog/GetByCategory?categoryId=' + categoryId);
    if (!res.ok) return [];
    var posts = await res.json();
    var map = await categoryMap();
    return posts.map(function (p) { return normalizePost(p, map); });
  }

  /* Throws Error('UNAUTHORIZED') if the session token is missing/expired, so callers
     can prompt the admin to log in again. */
  async function upsertPost(post) {
    var body = {
      title: post.title,
      slug: post.slug || null,
      categoryId: post.categoryId || null,
      content: post.content,
      author: post.author || null,
      thumbnailUrl: post.coverImage || null,
      isPublished: post.status === 'published'
    };
    var isUpdate = !!post.id;
    var url = API_BASE + (isUpdate ? '/api/Blog/Update?id=' + post.id : '/api/Blog/Create');
    var res = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify(body)
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('SAVE_FAILED');
    var map = await categoryMap();
    return normalizePost(await res.json(), map);
  }

  async function deletePost(id) {
    var res = await fetch(API_BASE + '/api/Blog/Delete?id=' + id, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('DELETE_FAILED');
  }

  /* Uploads a File/Blob and returns its public URL. */
  async function uploadFile(file) {
    var form = new FormData();
    form.append('file', file);
    var res = await fetch(API_BASE + '/api/Upload/File', {
      method: 'POST',
      headers: authHeaders(),
      body: form
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('UPLOAD_FAILED');
    var data = await res.json();
    return data.url;
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'post';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderPostBody(post) {
    return post.content || '';
  }

  return {
    login: login, logout: logout, isLoggedIn: isLoggedIn,
    getCategories: getCategories, createCategory: createCategory,
    getPosts: getPosts, getPost: getPost, getPostsByCategory: getPostsByCategory,
    upsertPost: upsertPost, deletePost: deletePost,
    uploadFile: uploadFile, slugify: slugify, escapeHtml: escapeHtml, renderPostBody: renderPostBody
  };
})();
