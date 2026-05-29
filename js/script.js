(function () {
  "use strict";

  var treeEl = document.getElementById("tree");
  var problemList = document.getElementById("problemList");
  var currentChapterEl = document.getElementById("currentChapter");
  var problemCountEl = document.getElementById("problemCount");
  var textbookSelect = document.getElementById("textbookSelect");
  var toggleAllBtn = document.getElementById("toggleAllBtn");

  var allExpanded = false;
  var currentChapterId = null;

  /* ============================================================
       API 接口层（占位实现，使用 MOCK_DATA）
       后续对接真实后端时，只需替换此对象的内部实现即可。
       ============================================================ */
  var API = {
    fetchTextbooks: function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(MOCK_DATA.textbooks);
        }, 100);
      });
    },

    fetchChapters: function (textbookId) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          var list = MOCK_DATA.chapters[textbookId] || [];
          resolve(list);
        }, 150);
      });
    },

    fetchProblems: function (chapterId) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          var list = MOCK_DATA.problems[chapterId] || [];
          resolve(list);
        }, 200);
      });
    },
  };

  /* ============================================================
       教材下拉菜单
       ============================================================ */
  function loadTextbookDropdown() {
    API.fetchTextbooks().then(function (textbooks) {
      textbooks.forEach(function (tb) {
        var opt = document.createElement("option");
        opt.value = tb.id;
        opt.textContent = tb.name;
        textbookSelect.appendChild(opt);
      });
    });
  }

  textbookSelect.addEventListener("change", function () {
    var tbId = parseInt(this.value);
    if (!tbId) {
      treeEl.innerHTML = '<li class="tree-placeholder">请先在上方选择教材</li>';
      problemList.innerHTML =
        '<div class="empty-state">请在左侧目录中选择章节查看题目</div>';
      currentChapterEl.textContent = "📖 请选择章节";
      problemCountEl.textContent = "共 0 题";
      currentChapterId = null;
      return;
    }
    currentChapterId = null;
    problemList.innerHTML =
      '<div class="empty-state">请在左侧目录中选择章节查看题目</div>';
    currentChapterEl.textContent = "📖 请选择章节";
    problemCountEl.textContent = "共 0 题";
    loadTree(tbId);
  });

  /* ============================================================
       目录树
       ============================================================ */
  function loadTree(textbookId) {
    treeEl.innerHTML = '<li class="tree-placeholder">加载中...</li>';
    API.fetchChapters(textbookId).then(function (chapters) {
      renderTree(chapters);
    });
  }

  function renderTree(chapters) {
    treeEl.innerHTML = "";
    chapters.forEach(function (ch) {
      var li = createTreeNode(ch);
      treeEl.appendChild(li);
    });
  }

  function createTreeNode(node) {
    var li = document.createElement("li");

    var nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    nodeDiv.dataset.id = node.id;

    var toggle = document.createElement("span");
    toggle.className = "tree-toggle";
    if (node.children && node.children.length > 0) {
      toggle.textContent = "▶";
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleNode(this);
      });
    } else {
      toggle.classList.add("leaf");
    }
    nodeDiv.appendChild(toggle);

    var icon = document.createElement("span");
    icon.className = "tree-icon";
    icon.textContent = "📖";
    nodeDiv.appendChild(icon);

    var label = document.createElement("span");
    label.className = "tree-label";
    label.textContent = node.name;
    nodeDiv.appendChild(label);

    nodeDiv.addEventListener("click", function () {
      selectChapter(node.id, node.name);
    });

    li.appendChild(nodeDiv);

    if (node.children && node.children.length > 0) {
      var childUl = document.createElement("ul");
      childUl.className = "tree-children collapsed";
      node.children.forEach(function (child) {
        childUl.appendChild(createTreeNode(child));
      });
      li.appendChild(childUl);

      if (node.depth === undefined || node.depth === 0) {
        childUl.classList.remove("collapsed");
        toggle.classList.add("expanded");
      }
    }

    return li;
  }

  function toggleNode(toggleEl) {
    var nodeDiv = toggleEl.parentElement;
    var li = nodeDiv.parentElement;
    var childUl = li.querySelector(".tree-children");
    if (!childUl) return;

    var isCollapsed = childUl.classList.contains("collapsed");
    if (isCollapsed) {
      childUl.classList.remove("collapsed");
      toggleEl.classList.add("expanded");
    } else {
      childUl.classList.add("collapsed");
      toggleEl.classList.remove("expanded");
    }
  }

  toggleAllBtn.addEventListener("click", function () {
    allExpanded = !allExpanded;
    toggleAllBtn.textContent = allExpanded ? "全部折叠" : "全部展开";

    var toggles = treeEl.querySelectorAll(".tree-toggle:not(.leaf)");
    var containers = treeEl.querySelectorAll(".tree-children");
    containers.forEach(function (ul) {
      if (allExpanded) {
        ul.classList.remove("collapsed");
      } else {
        ul.classList.add("collapsed");
      }
    });
    toggles.forEach(function (t) {
      if (allExpanded) {
        t.classList.add("expanded");
      } else {
        t.classList.remove("expanded");
      }
    });
  });

  function selectChapter(chapterId, chapterName) {
    currentChapterId = chapterId;

    treeEl.querySelectorAll(".tree-node.active").forEach(function (el) {
      el.classList.remove("active");
    });
    var activeNode = treeEl.querySelector(
      '.tree-node[data-id="' + chapterId + '"]',
    );
    if (activeNode) {
      activeNode.classList.add("active");
      var parent = activeNode.closest("li")
        ? activeNode.closest("li").parentElement
        : null;
      while (parent && parent.classList.contains("tree-children")) {
        parent.classList.remove("collapsed");
        var pt = parent.closest("li")
          ? parent.closest("li").querySelector(".tree-toggle")
          : null;
        if (pt) pt.classList.add("expanded");
        parent = parent.closest("li")
          ? parent.closest("li").parentElement
          : null;
      }
    }

    currentChapterEl.textContent = "📖 " + chapterName;
    problemList.innerHTML = '<div class="loading">加载中...</div>';
    problemCountEl.textContent = "共 0 题";

    loadProblems(chapterId);
  }

  /* ============================================================
       题目列表
       ============================================================ */
  function loadProblems(chapterId) {
    API.fetchProblems(chapterId).then(function (problems) {
      renderProblems(problems);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderProblems(problems) {
    if (!problems || problems.length === 0) {
      problemList.innerHTML = '<div class="empty-state">该章节暂无题目</div>';
      problemCountEl.textContent = "共 0 题";
      return;
    }

    problemCountEl.textContent = "共 " + problems.length + " 题";
    problemList.innerHTML = "";

    problems.forEach(function (p, index) {
      var card = document.createElement("div");
      card.className = "problem-card";

      var header = document.createElement("div");
      header.className = "problem-header";

      var num = document.createElement("span");
      num.className = "problem-number";
      num.textContent = "第 " + (index + 1) + " 题";
      header.appendChild(num);

      var src = document.createElement("span");
      src.className = "problem-source";
      src.textContent = p.source || "";
      header.appendChild(src);

      card.appendChild(header);

      var contentDiv = document.createElement("div");
      contentDiv.className = "problem-content";
      contentDiv.innerHTML = escapeHtml(p.content);
      card.appendChild(contentDiv);

      if (p.image) {
        var imgDiv = document.createElement("div");
        imgDiv.className = "problem-image";
        var img = document.createElement("img");
        img.src = p.image;
        img.alt = "题目配图";
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);
      }

      if (p.answer) {
        var answerSection = document.createElement("div");
        answerSection.className = "problem-answer";

        var toggleBtn = document.createElement("button");
        toggleBtn.className = "answer-toggle";
        toggleBtn.textContent = "显示答案";
        toggleBtn.addEventListener("click", function () {
          var body = this.parentElement.querySelector(".answer-body");
          var isVisible = body.classList.contains("visible");
          if (isVisible) {
            body.classList.remove("visible");
            this.textContent = "显示答案";
          } else {
            body.classList.add("visible");
            this.textContent = "隐藏答案";
          }
        });
        answerSection.appendChild(toggleBtn);

        var answerBody = document.createElement("div");
        answerBody.className = "answer-body";
        answerBody.innerHTML = "<strong>解：</strong>" + escapeHtml(p.answer);
        answerSection.appendChild(answerBody);

        card.appendChild(answerSection);
      }

      problemList.appendChild(card);
    });

    renderKaTeX();
  }

  /* ============================================================
       KaTeX 渲染
       ============================================================ */
  function renderKaTeX() {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(problemList, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    }
  }

  /* ============================================================
       键盘快捷键
       ============================================================ */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var visibleAnswer = problemList.querySelector(".answer-body.visible");
      if (visibleAnswer) {
        visibleAnswer.classList.remove("visible");
        var btn = visibleAnswer.parentElement.querySelector(".answer-toggle");
        if (btn) btn.textContent = "显示答案";
      }
    }
  });

  /* ============================================================
       初始化
       ============================================================ */
  function init() {
    loadTextbookDropdown();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
