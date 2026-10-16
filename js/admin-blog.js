/* Knowledge Center admin (/admin/blog/) — moved out of an inline <script> and
   into its own file. An inline block this size is fragile: certain dev-server
   live-reload injectors, some browser extensions, and any accidental
   "</script"-looking text anywhere inside it can make the browser stop
   treating it as script and dump the rest of it onto the page as literal
   text. An external .js file is never at risk of that — the browser fetches
   and executes it as a separate resource, never as HTML. */
(function ($) {
  $('#login-form').on('submit', async function (e) {
    e.preventDefault();
    var user = $('#login-username').val().trim();
    var pass = $('#login-password').val();
    var $btn = $(this).find('button[type=submit]');
    $btn.prop('disabled', true).text('Signing in…');
    $('#login-error').hide();
    try {
      var result = await AnstelBlog.login(user, pass);
      if (result && result.token) {
        document.documentElement.classList.add('admin-authed');
      } else {
        $('#login-error').text('Incorrect username or password.').show();
      }
    } catch (err) {
      $('#login-error').text('Could not reach the API. Make sure you\'re on the same network as the server.').show();
    } finally {
      $btn.prop('disabled', false).text('Sign In');
    }
  });

  function requireReauth() {
    AnstelBlog.logout();
    document.documentElement.classList.remove('admin-authed');
    alert('Your session has expired. Please log in again.');
  }

  $('#logout-btn').on('click', function () {
    AnstelBlog.logout();
    document.documentElement.classList.remove('admin-authed');
  });

  var currentId = null;
  var slugTouched = false;

  // Quill's built-in "video" format only ever renders an <iframe> — correct for
  // YouTube/Vimeo embeds, but a raw uploaded video file (or a direct .mp4 URL)
  // isn't a web page, so an iframe just shows blank. Register a second format
  // that renders a real <video> element for those cases instead.
  var BlockEmbed = Quill.import('blots/block/embed');
  function VideoFileBlot() {}
  VideoFileBlot.prototype = Object.create(BlockEmbed.prototype);
  VideoFileBlot.prototype.constructor = VideoFileBlot;
  VideoFileBlot.blotName = 'videoFile';
  VideoFileBlot.tagName = 'div';
  VideoFileBlot.className = 'ql-video-file';
  VideoFileBlot.create = function (url) {
    var node = BlockEmbed.create.call(this);
    var video = document.createElement('video');
    video.setAttribute('controls', '');
    video.setAttribute('src', url);
    node.appendChild(video);
    return node;
  };
  VideoFileBlot.value = function (node) {
    var video = node.querySelector('video');
    return video ? video.getAttribute('src') : '';
  };
  Quill.register(VideoFileBlot);

  var quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'Write your post…',
    modules: {
      toolbar: '#toolbar'
    }
  });

  // Custom handlers for the built-in Image/Video toolbar buttons — both trigger a
  // real, always-present <input type="file"> already sitting in the page (the
  // same pattern the working Cover Image upload uses), instead of a throwaway
  // input created in memory, which some browsers won't reliably open a file
  // picker for.
  var toolbar = quill.getModule('toolbar');
  var pendingRange = null;
  toolbar.addHandler('image', function () {
    pendingRange = quill.getSelection(true);
    document.getElementById('hidden-image-upload').click();
  });
  toolbar.addHandler('video', function () {
    pendingRange = quill.getSelection(true);
    document.getElementById('hidden-video-upload').click();
  });

  quill.on('text-change', updatePreview);

  function handleUpload(embedType) {
    return async function () {
      var file = this.files[0];
      if (!file) return;
      var range = pendingRange || quill.getSelection(true) || { index: quill.getLength() };
      var input = this;
      input.disabled = true;
      try {
        var url = await AnstelBlog.uploadFile(file);
        quill.insertEmbed(range.index, embedType, url, 'user');
        quill.setSelection(range.index + 1);
        updatePreview();
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') { requireReauth(); }
        else { alert('Upload failed. Make sure you\'re on the same network as the API server.'); }
      } finally {
        input.disabled = false;
        input.value = ''; // allow re-selecting the same file later
      }
    };
  }
  $('#hidden-image-upload').on('change', handleUpload('image'));
  $('#hidden-video-upload').on('change', handleUpload('videoFile'));

  /* Returns an iframe embed URL for YouTube/Vimeo links, or null for anything
     else (a direct video file, which needs a real <video> tag instead). */
  function toEmbedUrl(url) {
    url = String(url || '').trim();
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (yt) return 'https://www.youtube.com/embed/' + yt[1];
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return 'https://player.vimeo.com/video/' + vm[1];
    return null;
  }

  $('#btn-image-url').on('click', function () {
    var range = quill.getSelection(true);
    var url = prompt('Paste an image URL:');
    if (!url) return;
    url = AnstelBlog.safePublicUrl(url, false);
    if (!url) { alert('Please enter a valid HTTP or HTTPS image URL.'); return; }
    quill.insertEmbed(range.index, 'image', url, 'user');
    quill.setSelection(range.index + 1);
    updatePreview();
  });

  $('#btn-video-url').on('click', function () {
    var range = quill.getSelection(true);
    var url = prompt('Paste a YouTube/Vimeo link, or a direct video file URL:');
    if (!url) return;
    url = AnstelBlog.safePublicUrl(url, false);
    if (!url) { alert('Please enter a valid HTTP or HTTPS video URL.'); return; }
    var embed = toEmbedUrl(url);
    if (embed) {
      quill.insertEmbed(range.index, 'video', embed, 'user');
    } else {
      quill.insertEmbed(range.index, 'videoFile', url.trim(), 'user');
    }
    quill.setSelection(range.index + 1);
    updatePreview();
  });

  function updatePreview() {
    var title = $('#f-title').val() || 'Untitled Post';
    var cover = AnstelBlog.safePublicUrl($('#f-cover').val(), false);
    var categoryId = parseInt($('#f-category').val(), 10);
    var cat = categoriesList.find(function (c) { return c.id === categoryId; });
    var category = cat ? cat.name : '';
    var doc = '<!doctype html><html><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">' +
      '<link rel="stylesheet" href="/css/styles.css">' +
      '<style>body{padding:2.5rem 1.5rem 5rem}' +
      '.post-content img{max-width:100%;height:auto;border-radius:.75rem;display:block;margin:1.5rem auto}' +
      '.post-content iframe{width:100%;aspect-ratio:16/9;height:auto;border-radius:.75rem;border:0;display:block;margin:1.5rem auto}' +
      '.post-content video{width:100%;border-radius:.75rem;display:block;margin:1.5rem auto}' +
      '.post-content blockquote{border-left:3px solid #171a20;padding-left:1rem;font-style:italic;color:#374151;margin:1.5rem 0}' +
      '.post-content h1,.post-content h2,.post-content h3{margin-top:2rem;margin-bottom:1rem;font-weight:700}' +
      '.post-content p{font-size:14px;line-height:1.75;color:#374151}' +
      '.post-content pre{background:#171a20;color:#e5e7eb;border-radius:.75rem;padding:1.25rem;font-size:.88rem;overflow-x:auto;margin:1.5rem 0}</style></head><body>' +
      '<div style="max-width:720px;margin:auto">' +
      (category ? '<p class="section-eyebrow">' + AnstelBlog.escapeHtml(category) + '</p>' : '') +
      '<h1 class="fw-bold mb-4" style="font-size:clamp(1.75rem,4vw,2.75rem);letter-spacing:-.03em">' + AnstelBlog.escapeHtml(title) + '</h1>' +
      (cover ? '<img src="' + AnstelBlog.escapeHtml(cover) + '" class="img-fluid rounded-4 w-100 mb-4" style="max-height:420px;object-fit:cover" alt="">' : '') +
      '<div class="post-content">' + AnstelBlog.sanitizeRichHtml(quill.root.innerHTML) + '</div>' +
      '</div></body></html>';
    document.getElementById('preview-frame').srcdoc = doc;
  }

  var postsCache = [];
  var categoriesList = [];
  var ADD_CATEGORY_VALUE = '__add_new__';

  async function loadCategories() {
    categoriesList = await AnstelBlog.getCategories();
    categoriesList.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  /* Posts in these categories are shown on their own pages instead of the
     Knowledge Center (see company/customer-stories/). They are always offered
     in the dropdown; if one doesn't exist in the API yet, choosing it creates
     it — so nobody has to type the exact name by hand. */
  var SECTION_CATEGORIES = ['Customer Stories'];
  var CREATE_SECTION_PREFIX = '__create_section__:';

  function findCategoryByName(name) {
    var wanted = String(name || '').trim().toLowerCase();
    return categoriesList.find(function (c) { return String(c.name || '').trim().toLowerCase() === wanted; });
  }

  function populateCategoryDropdown(selectedId) {
    var html = '<option value=""' + (selectedId ? '' : ' selected') + ' disabled>Select a category…</option>';
    html += categoriesList.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + AnstelBlog.escapeHtml(c.name) + '</option>';
    }).join('');
    SECTION_CATEGORIES.forEach(function (name) {
      if (!findCategoryByName(name)) {
        html += '<option value="' + CREATE_SECTION_PREFIX + AnstelBlog.escapeHtml(name) + '">' + AnstelBlog.escapeHtml(name) + '</option>';
      }
    });
    html += '<option value="' + ADD_CATEGORY_VALUE + '">+ Add new category…</option>';
    $('#f-category').html(html);
  }

  async function renderPostsTable() {
    $('#posts-tbody').html('<tr><td colspan="5" class="text-center text-muted py-4">Loading…</td></tr>');
    try {
      postsCache = (await AnstelBlog.getPosts()).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    } catch (err) {
      // Log the real cause: this message used to hide data-format errors too.
      console.error('Could not load posts:', err);
      var networkError = err instanceof TypeError && /fetch/i.test(err.message || '');
      $('#posts-tbody').html('<tr><td colspan="5" class="text-center text-danger py-4">' +
        (networkError
          ? 'Could not reach the API. Make sure you\'re on the same network as the server.'
          : 'Posts could not be loaded. Open the browser console (F12) for details.') +
        '</td></tr>');
      return;
    }
    $('#posts-empty').toggle(postsCache.length === 0);
    $('#posts-tbody').html(postsCache.map(function (p) {
      return '<tr>' +
        '<td class="ps-3 fw-semibold">' + AnstelBlog.escapeHtml(p.title || 'Untitled') + '</td>' +
        '<td class="text-secondary">' + AnstelBlog.escapeHtml(p.category || '—') + '</td>' +
        '<td><span class="badge ' + (p.status === 'published' ? 'bg-success' : 'bg-secondary') + '">' + p.status + '</span></td>' +
        '<td class="text-secondary small">' + new Date(p.updatedAt || Date.now()).toLocaleDateString() + '</td>' +
        '<td class="text-end pe-3">' +
        '<button class="btn btn-sm btn-outline-dark me-1" data-edit="' + p.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-outline-danger" data-del="' + p.id + '">Delete</button>' +
        '</td></tr>';
    }).join(''));
  }

  function showList() {
    $('#editor-view').hide();
    $('#list-view').show();
    renderPostsTable();
  }

  function showEditor() {
    $('#list-view').hide();
    $('#editor-view').show();
    updatePreview();
  }

  function newPost() {
    currentId = null;
    slugTouched = false;
    $('#f-title, #f-slug, #f-cover').val('');
    populateCategoryDropdown(null);
    $('#new-category-row').hide();
    $('#f-category').show();
    $('#f-status').val('draft');
    $('#f-cover-preview').hide();
    $('#delete-post-btn').hide();
    $('#save-msg').hide();
    quill.setContents([]);
    showEditor();
  }

  function editPost(id) {
    var post = postsCache.find(function (p) { return p.id === id; });
    if (!post) return;
    currentId = post.id;
    slugTouched = true;
    $('#f-title').val(post.title || '');
    $('#f-slug').val(post.slug || '');
    populateCategoryDropdown(post.categoryId);
    $('#new-category-row').hide();
    $('#f-category').show();
    $('#f-cover').val(post.coverImage || '');
    $('#f-status').val(post.status || 'draft');
    if (post.coverImage) $('#f-cover-preview').attr('src', post.coverImage).show(); else $('#f-cover-preview').hide();
    quill.clipboard.dangerouslyPasteHTML(AnstelBlog.sanitizeRichHtml(post.content || ''));
    $('#delete-post-btn').show();
    $('#save-msg').hide();
    showEditor();
  }

  async function savePost() {
    var post = {
      id: currentId || null,
      title: $('#f-title').val().trim(),
      slug: AnstelBlog.slugify($('#f-slug').val() || $('#f-title').val()),
      categoryId: parseInt($('#f-category').val(), 10) || null,
      coverImage: AnstelBlog.safePublicUrl($('#f-cover').val(), false),
      status: $('#f-status').val(),
      content: AnstelBlog.sanitizeRichHtml(quill.root.innerHTML)
    };
    var $btn = $('#save-post-btn');
    $btn.prop('disabled', true).text('Saving…');
    try {
      var saved = await AnstelBlog.upsertPost(post);
      currentId = saved.id;
      $('#f-slug').val(saved.slug);
      $('#delete-post-btn').show();
      $('#save-msg').show();
      setTimeout(function () { $('#save-msg').fadeOut(); }, 1800);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') { requireReauth(); }
      else { alert('Could not save. Make sure you\'re on the same network as the API server.'); }
    } finally {
      $btn.prop('disabled', false).text('Save Post');
    }
  }

  $(function () {
    loadCategories();
    renderPostsTable();

    $('#new-post-btn').on('click', newPost);
    $('#back-to-list').on('click', showList);
    $('#save-post-btn').on('click', savePost);

    /* Deletes a post and reports the real outcome. The API can answer a
       delete with an error status even though the post was removed, so on any
       error the post list is re-read: if the post is gone, it was deleted. */
    var deleting = false;
    async function deletePostById(id, $button) {
      if (deleting) return false; // ignore double-clicks
      if (!confirm('Delete this post? This can\'t be undone.')) return false;
      deleting = true;
      if ($button) $button.prop('disabled', true).text('Deleting…');
      try {
        await AnstelBlog.deletePost(id);
        return true;
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') { requireReauth(); return false; }
        var stillThere = true;
        try {
          var posts = await AnstelBlog.getPosts();
          stillThere = posts.some(function (p) { return String(p.id) === String(id); });
        } catch (_) { /* can't confirm — treat as not deleted */ }
        if (!stillThere) return true;
        alert('Could not delete this post' + (err.status ? ' (server answered HTTP ' + err.status + ')' : '') +
          '. Make sure you\'re on the same network as the API server.');
        return false;
      } finally {
        deleting = false;
        if ($button) $button.prop('disabled', false).text('Delete');
      }
    }

    $('#delete-post-btn').on('click', async function () {
      if (!currentId) return;
      if (await deletePostById(currentId, $(this))) showList();
    });

    $('#posts-tbody').on('click', '[data-edit]', function () { editPost($(this).data('edit')); });
    $('#posts-tbody').on('click', '[data-del]', async function () {
      // Always refresh, so the list shows the server's real state either way.
      await deletePostById($(this).data('del'), $(this));
      renderPostsTable();
    });

    $('#f-cover-upload').on('change', async function () {
      var file = this.files[0];
      if (!file) return;
      var input = this;
      input.disabled = true;
      try {
        var url = await AnstelBlog.uploadFile(file);
        $('#f-cover').val(url);
        $('#f-cover-preview').attr('src', url).show();
        updatePreview();
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') { requireReauth(); }
        else { alert('Upload failed. Make sure you\'re on the same network as the API server.'); }
      } finally {
        input.disabled = false;
        input.value = '';
      }
    });

    $('#f-cover').on('input', function () {
      var v = AnstelBlog.safePublicUrl($(this).val(), false);
      if (v) $('#f-cover-preview').attr('src', v).show(); else $('#f-cover-preview').hide();
    });

    $('#f-title, #f-cover').on('input', updatePreview);
    $('#f-title').on('input', function () {
      if (!slugTouched) $('#f-slug').val(AnstelBlog.slugify($(this).val()));
    });
    $('#f-slug').on('input', function () { slugTouched = true; });

    $('#f-category').on('change', async function () {
      var value = $(this).val() || '';
      if (value === ADD_CATEGORY_VALUE) {
        $('#f-category').hide();
        $('#new-category-row').show();
        $('#new-category-input').val('').focus();
      } else if (value.indexOf(CREATE_SECTION_PREFIX) === 0) {
        // First use of a section category (e.g. Customer Stories): create it.
        var name = value.slice(CREATE_SECTION_PREFIX.length);
        var $select = $('#f-category').prop('disabled', true);
        try {
          var existing = findCategoryByName(name);
          var created = existing || await AnstelBlog.createCategory(name);
          await loadCategories();
          var match = findCategoryByName(name) || created;
          populateCategoryDropdown(match.id);
        } catch (err) {
          populateCategoryDropdown(null);
          if (err.message === 'UNAUTHORIZED') { requireReauth(); }
          else { alert('Could not create the "' + name + '" category. Make sure you\'re on the same network as the API server.'); }
        } finally {
          $select.prop('disabled', false);
        }
      }
      updatePreview();
    });

    async function confirmNewCategory() {
      var name = $('#new-category-input').val().trim();
      if (!name) {
        populateCategoryDropdown(null);
        $('#new-category-row').hide();
        $('#f-category').show();
        return;
      }
      var $btn = $('#add-category-btn');
      $btn.prop('disabled', true).text('Adding…');
      try {
        var created = await AnstelBlog.createCategory(name);
        await loadCategories();
        populateCategoryDropdown(created.id);
        $('#new-category-row').hide();
        $('#f-category').show();
        updatePreview();
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') { requireReauth(); }
        else { alert('Could not add category. Make sure you\'re on the same network as the API server.'); }
      } finally {
        $btn.prop('disabled', false).text('Add');
      }
    }

    $('#add-category-btn').on('click', confirmNewCategory);
    $('#new-category-input').on('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory(); }
    });
    $('#cancel-category-btn').on('click', function () {
      populateCategoryDropdown(null);
      $('#new-category-row').hide();
      $('#f-category').show();
    });

    $('[data-preview-w]').on('click', function () {
      $('[data-preview-w]').removeClass('active');
      $(this).addClass('active');
      $('#preview-wrap').css('width', $(this).data('preview-w'));
    });
  });
})(jQuery);
