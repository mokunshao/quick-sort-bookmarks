var message = document.getElementById('message');

window.onload = function () {
  reorder_tree();
};

function reorder_tree() {
  chrome.bookmarks.getTree(function (results) {
    var node;
    var stack = [];
    stack.push(results[0]);
    while (stack.length > 0) {
      node = stack.pop();
      if (!node || !is_folder(node)) {
        continue;
      }
      stack = stack.concat(node.children);
      sortChildren(node);
    }
  });
  message.innerText = 'Bookmarks sorted.';
}

function is_folder(node) {
  return 'children' in node;
}

function is_root(node) {
  return node.id == '0';
}

function comparator(a, b) {
  var sort = 0;
  var isFolderA = a.url === undefined;
  var isFolderB = b.url === undefined;
  if (isFolderA && isFolderB) {
    var titleA = a.title;
    var titleB = b.title;
    if (titleA < titleB) {
      sort = -1;
    } else if (titleA > titleB) {
      sort = 1;
    }
  } else if (isFolderA && !isFolderB) {
    sort = -1;
  } else if (!isFolderA && isFolderB) {
    sort = 1;
  } else {
    var urlA = a.url;
    var urlB = b.url;
    if (urlA < urlB) {
      sort = -1;
    } else if (urlA > urlB) {
      sort = 1;
    }
  }
  return sort;
}

function sortChildren(parent) {
  var children = parent.children;
  var childrenLength = children.length;
  if (!parent || !is_folder(parent) || is_root(parent) || childrenLength <= 1) {
    return;
  }

  children.sort(comparator);
  for (var i = 0; i < childrenLength; i++) {
    var child = children[i];
    if (i === child.index) {
      continue;
    }
    chrome.bookmarks.move(child.id, { index: i });
  }
}
