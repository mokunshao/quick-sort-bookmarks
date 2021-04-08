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
  var isFolderA = a.url === undefined ? true : false;
  var isFolderB = b.url === undefined ? true : false;
  if (isFolderA && !isFolderB) {
    sort = -1;
  } else if (!isFolderA && isFolderB) {
    sort = 1;
  }
  if (a.url < b.url) {
    sort = -1;
  } else if (a.url > b.url) {
    sort = 1;
  }
  return sort;
}

function sortChildren(parent) {
  if (
    !parent ||
    !is_folder(parent) ||
    is_root(parent) ||
    parent.children.length <= 1
  ) {
    return;
  }

  parent.children.sort(comparator);

  for (var i in parent.children) {
    var child = parent.children[i];
    if (i == child.index) {
      continue;
    }
    chrome.bookmarks.move(child.id, { index: parseInt(i) });
  }
}
