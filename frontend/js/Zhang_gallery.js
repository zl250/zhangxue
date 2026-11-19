/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：科技图文列表页交互，请求 /api/gallery 并渲染图文数据
*/

(function () {
  "use strict";

  var Zhang_grid = document.getElementById("Zhang_galleryGrid");
  var Zhang_count = document.getElementById("Zhang_galleryCount");

  if (!Zhang_grid || !Zhang_count) {
    return;
  }

  function Zhang_formatLikes(Zhang_likes) {
    return Number(Zhang_likes || 0).toLocaleString("zh-CN");
  }

  function Zhang_createCard(Zhang_item) {
    var Zhang_card = document.createElement("article");
    Zhang_card.className = "Zhang_galleryCard";

    var Zhang_figure = document.createElement("figure");
    Zhang_figure.className = "Zhang_galleryCard__figure";

    var Zhang_img = document.createElement("img");
    Zhang_img.className = "Zhang_galleryCard__img";
    Zhang_img.src = Zhang_item.Zhang_image;
    Zhang_img.alt = Zhang_item.Zhang_title;
    Zhang_img.loading = "lazy";
    Zhang_figure.appendChild(Zhang_img);

    var Zhang_tag = document.createElement("span");
    Zhang_tag.className = "Zhang_galleryCard__tag";
    Zhang_tag.textContent = Zhang_item.Zhang_tag;
    Zhang_figure.appendChild(Zhang_tag);

    var Zhang_body = document.createElement("div");
    Zhang_body.className = "Zhang_galleryCard__body";

    var Zhang_title = document.createElement("h3");
    Zhang_title.className = "Zhang_galleryCard__title";
    Zhang_title.textContent = Zhang_item.Zhang_title;

    var Zhang_desc = document.createElement("p");
    Zhang_desc.className = "Zhang_galleryCard__desc";
    Zhang_desc.textContent = Zhang_item.Zhang_desc;

    var Zhang_foot = document.createElement("div");
    Zhang_foot.className = "Zhang_galleryCard__foot";

    var Zhang_time = document.createElement("time");
    Zhang_time.textContent = Zhang_item.Zhang_time;
    Zhang_foot.appendChild(Zhang_time);

    var Zhang_likes = document.createElement("span");
    Zhang_likes.className = "Zhang_galleryCard__likes";
    Zhang_likes.textContent = "♥ " + Zhang_formatLikes(Zhang_item.Zhang_likes);
    Zhang_foot.appendChild(Zhang_likes);

    Zhang_body.appendChild(Zhang_title);
    Zhang_body.appendChild(Zhang_desc);
    Zhang_body.appendChild(Zhang_foot);

    Zhang_card.appendChild(Zhang_figure);
    Zhang_card.appendChild(Zhang_body);

    return Zhang_card;
  }

  function Zhang_showState(Zhang_message, Zhang_isError) {
    Zhang_grid.textContent = "";

    var Zhang_state = document.createElement("div");
    Zhang_state.className = "Zhang_galleryState" + (Zhang_isError ? " is-error" : "");
    Zhang_state.textContent = Zhang_message;

    if (Zhang_isError) {
      var Zhang_retry = document.createElement("button");
      Zhang_retry.type = "button";
      Zhang_retry.className = "Zhang_galleryRetry";
      Zhang_retry.textContent = "重新加载";
      Zhang_retry.addEventListener("click", Zhang_loadGallery);
      Zhang_state.appendChild(document.createElement("br"));
      Zhang_state.appendChild(Zhang_retry);
    }

    Zhang_grid.appendChild(Zhang_state);
  }

  function Zhang_loadGallery() {
    Zhang_count.textContent = "加载中…";
    Zhang_showState("正在从数据库读取科技图文…", false);

    fetch("/api/gallery")
      .then(function (Zhang_response) {
        if (!Zhang_response.ok) {
          throw new Error("HTTP " + Zhang_response.status);
        }
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[科技图文] /api/gallery", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          throw new Error(Zhang_result.msg || "接口返回异常");
        }

        Zhang_count.textContent = "共 " + Zhang_result.data.total + " 组";
        Zhang_grid.textContent = "";

        (Zhang_result.data.list || []).forEach(function (Zhang_item) {
          Zhang_grid.appendChild(Zhang_createCard(Zhang_item));
        });
      })
      .catch(function (Zhang_error) {
        console.error("[科技图文加载失败] /api/gallery", Zhang_error);
        Zhang_count.textContent = "加载失败";
        Zhang_showState("图文加载失败：" + Zhang_error.message + "，请检查后端服务与数据库。", true);
      });
  }

  Zhang_loadGallery();
})();
