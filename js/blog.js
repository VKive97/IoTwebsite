/* Shared blog data helpers — localStorage-backed prototype (no backend).
   Used by /admin/blog/ (author, Quill-based rich-text editor) and /company/blog/
   (public listing + post pages). Post content is stored as HTML from the Quill editor. */
window.AnstelBlog = (function () {
  var STORAGE_KEY = 'anstel_blog_posts';

  function getPosts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function getPost(slug) {
    return getPosts().find(function (p) { return p.slug === slug; });
  }

  function upsertPost(post) {
    var posts = getPosts();
    var i = posts.findIndex(function (p) { return p.id === post.id; });
    if (i > -1) posts[i] = post; else posts.push(post);
    savePosts(posts);
    return post;
  }

  function deletePost(id) {
    savePosts(getPosts().filter(function (p) { return p.id !== id; }));
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
    getPosts: getPosts, savePosts: savePosts, getPost: getPost, upsertPost: upsertPost,
    deletePost: deletePost, slugify: slugify, escapeHtml: escapeHtml, renderPostBody: renderPostBody
  };
})();
