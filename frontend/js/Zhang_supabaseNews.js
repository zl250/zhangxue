/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
  说明：知乎新闻页交互，使用原生 fetch 调用 Supabase REST 接口
*/

(function () {
  "use strict";

  var Zhang_SUPABASE_URL = "https://cbsevsqqsvqjukvojyny.supabase.co";
  var Zhang_SUPABASE_KEY = "sb_publishable_SHksLThf9px340q4AwaEaw_Kbpy9qZc";
  var Zhang_REST = Zhang_SUPABASE_URL + "/rest/v1";

  var Zhang_topicsBox = document.getElementById("Zhang_snTopics");
  var Zhang_grid = document.getElementById("Zhang_snGrid");
  var Zhang_status = document.getElementById("Zhang_snStatus");
  var Zhang_keyword = document.getElementById("Zhang_snKeyword");
  var Zhang_refresh = document.getElementById("Zhang_snRefresh");
  var Zhang_detail = document.getElementById("Zhang_snDetail");
  var Zhang_detailBody = document.getElementById("Zhang_snDetailBody");
  var Zhang_mask = document.getElementById("Zhang_snMask");
  var Zhang_close = document.getElementById("Zhang_snClose");

  if (!Zhang_grid) {
    return;
  }

  var Zhang_state = {
    topicId: 0,
    keyword: "",
    loading: false
  };

  var Zhang_SENTIMENT_TEXT = {
    positive: "正面",
    neutral: "中性",
    negative: "负面"
  };

  function Zhang_headers() {
    return {
      apikey: Zhang_SUPABASE_KEY,
      Authorization: "Bearer " + Zhang_SUPABASE_KEY
    };
  }

  function Zhang_el(Zhang_tag, Zhang_class, Zhang_text) {
    var Zhang_node = document.createElement(Zhang_tag);

    if (Zhang_class) {
      Zhang_node.className = Zhang_class;
    }

    if (Zhang_text !== undefined) {
      Zhang_node.textContent = Zhang_text;
    }

    return Zhang_node;
  }

  function Zhang_setStatus(Zhang_text, Zhang_isError) {
    Zhang_status.textContent = Zhang_text || "";
    Zhang_status.className =
      "Zhang_snStatus" + (Zhang_isError ? " Zhang_snStatus--error" : "");
  }

  function Zhang_formatTime(Zhang_value) {
    if (!Zhang_value) {
      return "";
    }

    var Zhang_date = new Date(Zhang_value);

    if (isNaN(Zhang_date.getTime())) {
      return Zhang_value;
    }

    function Zhang_pad(Zhang_num) {
      return Zhang_num < 10 ? "0" + Zhang_num : String(Zhang_num);
    }

    return (
      Zhang_date.getFullYear() +
      "-" +
      Zhang_pad(Zhang_date.getMonth() + 1) +
      "-" +
      Zhang_pad(Zhang_date.getDate()) +
      " " +
      Zhang_pad(Zhang_date.getHours()) +
      ":" +
      Zhang_pad(Zhang_date.getMinutes())
    );
  }

  function Zhang_fetchJson(Zhang_url) {
    return fetch(Zhang_url, { headers: Zhang_headers() }).then(function (
      Zhang_response
    ) {
      if (!Zhang_response.ok) {
        return Zhang_response.text().then(function (Zhang_text) {
          throw new Error("HTTP " + Zhang_response.status + "：" + Zhang_text);
        });
      }

      return Zhang_response.json();
    });
  }

  /* ---------------- 话题 ---------------- */

  function Zhang_renderTopics(Zhang_topics) {
    Zhang_topicsBox.textContent = "";

    var Zhang_all = Zhang_el("button", "Zhang_snTopic Zhang_snTopic--active", "全部");
    Zhang_all.type = "button";
    Zhang_all.addEventListener("click", function () {
      Zhang_selectTopic(0, Zhang_all);
    });
    Zhang_topicsBox.appendChild(Zhang_all);

    Zhang_topics.forEach(function (Zhang_topic) {
      var Zhang_btn = Zhang_el("button", "Zhang_snTopic", "# " + Zhang_topic.name);
      Zhang_btn.type = "button";
      Zhang_btn.addEventListener("click", function () {
        Zhang_selectTopic(Zhang_topic.id, Zhang_btn);
      });
      Zhang_topicsBox.appendChild(Zhang_btn);
    });
  }

  function Zhang_selectTopic(Zhang_id, Zhang_btn) {
    Zhang_state.topicId = Zhang_id;

    Array.prototype.forEach.call(
      Zhang_topicsBox.children,
      function (Zhang_item) {
        Zhang_item.className = "Zhang_snTopic";
      }
    );

    Zhang_btn.className = "Zhang_snTopic Zhang_snTopic--active";
    Zhang_loadNews();
  }

  function Zhang_loadTopics() {
    var Zhang_url = Zhang_REST + "/zhihu_topics?select=id,name,slug,heat&order=heat.desc";

    Zhang_fetchJson(Zhang_url)
      .then(function (Zhang_data) {
        console.log("[Supabase 返回] 话题列表", Zhang_data);
        Zhang_renderTopics(Zhang_data);
      })
      .catch(function (Zhang_error) {
        console.error("[话题加载失败]", Zhang_error);
      });
  }

  /* ---------------- 新闻列表 ---------------- */

  function Zhang_renderNews(Zhang_news) {
    Zhang_grid.textContent = "";

    if (!Zhang_news || Zhang_news.length === 0) {
      Zhang_grid.appendChild(
        Zhang_el("p", "Zhang_snEmpty", "没有找到符合条件的新闻，换个关键词试试。")
      );
      return;
    }

    Zhang_news.forEach(function (Zhang_item, Zhang_index) {
      var Zhang_card = Zhang_el("article", "Zhang_snCard");
      Zhang_card.tabIndex = 0;
      Zhang_card.style.animationDelay = Math.min(Zhang_index * 0.05, 0.4) + "s";

      var Zhang_cover = Zhang_el("div", "Zhang_snCard__cover");
      var Zhang_img = document.createElement("img");
      Zhang_img.className = "Zhang_snCard__img";
      Zhang_img.alt = Zhang_item.title;
      Zhang_img.loading = "lazy";
      Zhang_img.src = Zhang_item.cover_url || "";
      Zhang_img.addEventListener("error", function () {
        Zhang_img.remove();
      });
      Zhang_cover.appendChild(Zhang_img);

      var Zhang_badges = Zhang_el("div", "Zhang_snCard__badges");

      if (Zhang_item.zhihu_topics && Zhang_item.zhihu_topics.name) {
        Zhang_badges.appendChild(
          Zhang_el(
            "span",
            "Zhang_snBadge Zhang_snBadge--topic",
            Zhang_item.zhihu_topics.name
          )
        );
      }

      if (Zhang_item.is_featured) {
        Zhang_badges.appendChild(
          Zhang_el("span", "Zhang_snBadge Zhang_snBadge--featured", "推荐")
        );
      }

      Zhang_cover.appendChild(Zhang_badges);

      var Zhang_body = Zhang_el("div", "Zhang_snCard__body");
      Zhang_body.appendChild(Zhang_el("h3", "Zhang_snCard__title", Zhang_item.title));
      Zhang_body.appendChild(
        Zhang_el("p", "Zhang_snCard__summary", Zhang_item.summary)
      );

      var Zhang_meta = Zhang_el("div", "Zhang_snCard__meta");
      [
        Zhang_item.source,
        Zhang_item.author,
        Zhang_formatTime(Zhang_item.published_at),
        "浏览 " + Zhang_item.view_count,
        "点赞 " + Zhang_item.like_count
      ].forEach(function (Zhang_text) {
        if (Zhang_text) {
          Zhang_meta.appendChild(Zhang_el("span", "", Zhang_text));
        }
      });

      Zhang_body.appendChild(Zhang_meta);
      Zhang_card.appendChild(Zhang_cover);
      Zhang_card.appendChild(Zhang_body);

      function Zhang_open() {
        Zhang_openDetail(Zhang_item.id);
      }

      Zhang_card.addEventListener("click", Zhang_open);
      Zhang_card.addEventListener("keydown", function (Zhang_event) {
        if (Zhang_event.key === "Enter" || Zhang_event.key === " ") {
          Zhang_event.preventDefault();
          Zhang_open();
        }
      });

      Zhang_grid.appendChild(Zhang_card);
    });
  }

  function Zhang_loadNews() {
    if (Zhang_state.loading) {
      return;
    }

    Zhang_state.loading = true;
    Zhang_state.keyword = Zhang_keyword.value.trim();
    Zhang_setStatus("正在加载新闻…");

    var Zhang_query =
      "/zhihu_news?select=*,zhihu_topics(name,slug,color)&order=published_at.desc";

    if (Zhang_state.topicId) {
      Zhang_query += "&topic_id=eq." + Zhang_state.topicId;
    }

    if (Zhang_state.keyword) {
      Zhang_query += "&title=ilike." + encodeURIComponent("*" + Zhang_state.keyword + "*");
    }

    Zhang_fetchJson(Zhang_REST + Zhang_query)
      .then(function (Zhang_data) {
        console.log("[Supabase 返回] 新闻列表", Zhang_data);
        Zhang_renderNews(Zhang_data);
        Zhang_setStatus("共 " + Zhang_data.length + " 条新闻");
      })
      .catch(function (Zhang_error) {
        console.error("[新闻加载失败]", Zhang_error);
        Zhang_grid.textContent = "";
        Zhang_grid.appendChild(
          Zhang_el("p", "Zhang_snEmpty", "加载失败：" + Zhang_error.message)
        );
        Zhang_setStatus("加载失败", true);
      })
      .then(function () {
        Zhang_state.loading = false;
      });
  }

  /* ---------------- 详情 ---------------- */

  function Zhang_renderDetail(Zhang_news, Zhang_comments) {
    Zhang_detailBody.textContent = "";

    Zhang_detailBody.appendChild(
      Zhang_el("h2", "Zhang_snDetail__title", Zhang_news.title)
    );

    var Zhang_meta = Zhang_el("div", "Zhang_snDetail__meta");
    [
      Zhang_news.zhihu_topics && Zhang_news.zhihu_topics.name,
      Zhang_news.source,
      Zhang_news.author,
      Zhang_formatTime(Zhang_news.published_at),
      "浏览 " + Zhang_news.view_count,
      "点赞 " + Zhang_news.like_count
    ].forEach(function (Zhang_text) {
      if (Zhang_text) {
        Zhang_meta.appendChild(Zhang_el("span", "", Zhang_text));
      }
    });
    Zhang_detailBody.appendChild(Zhang_meta);

    Zhang_detailBody.appendChild(
      Zhang_el("p", "Zhang_snDetail__content", Zhang_news.content || Zhang_news.summary)
    );

    var Zhang_commentsBox = Zhang_el("section", "Zhang_snComments");
    Zhang_commentsBox.appendChild(
      Zhang_el("p", "Zhang_snComments__title", "评论 · " + Zhang_comments.length + " 条")
    );

    if (Zhang_comments.length === 0) {
      Zhang_commentsBox.appendChild(
        Zhang_el("p", "Zhang_snComment__meta", "还没有评论。")
      );
    }

    Zhang_comments.forEach(function (Zhang_comment) {
      var Zhang_item = Zhang_el("div", "Zhang_snComment");
      var Zhang_head = Zhang_el("div", "Zhang_snComment__head");

      var Zhang_left = Zhang_el("span", "Zhang_snComment__name", Zhang_comment.nickname);
      var Zhang_tag = Zhang_el(
        "span",
        "Zhang_snComment__tag Zhang_snComment__tag--" + Zhang_comment.sentiment,
        Zhang_SENTIMENT_TEXT[Zhang_comment.sentiment] || "中性"
      );
      Zhang_left.appendChild(document.createTextNode(" "));
      Zhang_left.appendChild(Zhang_tag);

      Zhang_head.appendChild(Zhang_left);
      Zhang_head.appendChild(
        Zhang_el("span", "Zhang_snComment__meta", "点赞 " + Zhang_comment.like_count)
      );

      Zhang_item.appendChild(Zhang_head);
      Zhang_item.appendChild(
        Zhang_el("p", "Zhang_snComment__text", Zhang_comment.content)
      );
      Zhang_commentsBox.appendChild(Zhang_item);
    });

    Zhang_detailBody.appendChild(Zhang_commentsBox);
  }

  function Zhang_openDetail(Zhang_id) {
    Zhang_detail.className = "Zhang_snDetail Zhang_snDetail--open";
    Zhang_detail.setAttribute("aria-hidden", "false");
    Zhang_detailBody.textContent = "";
    Zhang_detailBody.appendChild(
      Zhang_el("p", "Zhang_snLoading", "正在加载新闻详情与评论…")
    );

    var Zhang_newsUrl =
      Zhang_REST +
      "/zhihu_news?select=*,zhihu_topics(name,slug,color)&id=eq." +
      Zhang_id;
    var Zhang_commentUrl =
      Zhang_REST +
      "/zhihu_comments?select=*&news_id=eq." +
      Zhang_id +
      "&order=like_count.desc";

    Promise.all([Zhang_fetchJson(Zhang_newsUrl), Zhang_fetchJson(Zhang_commentUrl)])
      .then(function (Zhang_results) {
        console.log("[Supabase 返回] 新闻详情", Zhang_results[0]);
        console.log("[Supabase 返回] 评论列表", Zhang_results[1]);

        if (!Zhang_results[0] || Zhang_results[0].length === 0) {
          throw new Error("新闻不存在");
        }

        Zhang_renderDetail(Zhang_results[0][0], Zhang_results[1]);
      })
      .catch(function (Zhang_error) {
        console.error("[详情加载失败]", Zhang_error);
        Zhang_detailBody.textContent = "";
        Zhang_detailBody.appendChild(
          Zhang_el("p", "Zhang_snStatus Zhang_snStatus--error", "加载失败：" + Zhang_error.message)
        );
      });
  }

  function Zhang_closeDetail() {
    Zhang_detail.className = "Zhang_snDetail";
    Zhang_detail.setAttribute("aria-hidden", "true");
  }

  /* ---------------- 事件绑定 ---------------- */

  var Zhang_timer = null;

  Zhang_keyword.addEventListener("input", function () {
    clearTimeout(Zhang_timer);
    Zhang_timer = setTimeout(function () {
      Zhang_loadNews();
    }, 350);
  });

  Zhang_refresh.addEventListener("click", function () {
    Zhang_keyword.value = "";
    Zhang_state.topicId = 0;
    Array.prototype.forEach.call(Zhang_topicsBox.children, function (Zhang_item) {
      Zhang_item.className = "Zhang_snTopic";
    });
    if (Zhang_topicsBox.firstChild) {
      Zhang_topicsBox.firstChild.className = "Zhang_snTopic Zhang_snTopic--active";
    }
    Zhang_loadNews();
  });

  Zhang_close.addEventListener("click", Zhang_closeDetail);
  Zhang_mask.addEventListener("click", Zhang_closeDetail);
  document.addEventListener("keydown", function (Zhang_event) {
    if (Zhang_event.key === "Escape") {
      Zhang_closeDetail();
    }
  });

  Zhang_loadTopics();
  Zhang_loadNews();
})();
