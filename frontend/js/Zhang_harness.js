/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
  说明：Harness Engineering 页面交互，商业评论结构化抽取与图像识别/OCR
*/

(function () {
  "use strict";

  var Zhang_reviewForm = document.getElementById("Zhang_hxReviewForm");
  var Zhang_reviewText = document.getElementById("Zhang_hxReviewText");
  var Zhang_reviewBtn = document.getElementById("Zhang_hxReviewBtn");
  var Zhang_reviewHint = document.getElementById("Zhang_hxReviewHint");
  var Zhang_reviewResult = document.getElementById("Zhang_hxReviewResult");
  var Zhang_samples = document.getElementById("Zhang_hxSamples");

  var Zhang_drop = document.getElementById("Zhang_hxDrop");
  var Zhang_imageInput = document.getElementById("Zhang_hxImage");
  var Zhang_preview = document.getElementById("Zhang_hxPreview");
  var Zhang_imageBtn = document.getElementById("Zhang_hxImageBtn");
  var Zhang_imageHint = document.getElementById("Zhang_hxImageHint");
  var Zhang_imageResult = document.getElementById("Zhang_hxImageResult");

  if (!Zhang_reviewForm || !Zhang_imageBtn) {
    return;
  }

  var Zhang_selectedImage = null;
  var Zhang_busy = false;

  var Zhang_SENTIMENT_TEXT = {
    positive: "正面",
    neutral: "中性",
    negative: "负面"
  };

  var Zhang_TYPE_TEXT = {
    text: "文字为主",
    object: "物体为主",
    scene: "场景为主",
    mixed: "图文混合"
  };

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

  function Zhang_clear(Zhang_box) {
    Zhang_box.textContent = "";
  }

  function Zhang_badge(Zhang_type, Zhang_text) {
    return Zhang_el("span", "Zhang_hxBadge Zhang_hxBadge--" + Zhang_type, Zhang_text);
  }

  function Zhang_sectionTitle(Zhang_text) {
    return Zhang_el("p", "Zhang_hxSection__title", Zhang_text);
  }

  function Zhang_copyButton(Zhang_data) {
    var Zhang_btn = Zhang_el("button", "Zhang_hxCopy", "复制 JSON");
    Zhang_btn.type = "button";
    Zhang_btn.addEventListener("click", function () {
      var Zhang_text = JSON.stringify(Zhang_data, null, 2);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(Zhang_text).then(function () {
          Zhang_btn.textContent = "已复制";
          setTimeout(function () {
            Zhang_btn.textContent = "复制 JSON";
          }, 1500);
        });
      }
    });

    return Zhang_btn;
  }

  function Zhang_rawJson(Zhang_parent, Zhang_data) {
    var Zhang_head = Zhang_el("div", "Zhang_hxJsonHead");
    Zhang_head.appendChild(Zhang_sectionTitle("返回的 JSON"));
    Zhang_head.appendChild(Zhang_copyButton(Zhang_data));
    Zhang_parent.appendChild(Zhang_head);

    var Zhang_pre = Zhang_el("pre", "Zhang_hxJson", JSON.stringify(Zhang_data, null, 2));
    Zhang_parent.appendChild(Zhang_pre);
  }

  /* ---------------- 商业评论抽取 ---------------- */

  function Zhang_renderReview(Zhang_payload) {
    var Zhang_result = Zhang_payload.result;
    Zhang_clear(Zhang_reviewResult);

    var Zhang_badges = Zhang_el("div", "Zhang_hxBadges");
    Zhang_badges.appendChild(
      Zhang_badge(Zhang_result.sentiment, Zhang_SENTIMENT_TEXT[Zhang_result.sentiment])
    );

    var Zhang_bar = Zhang_el("div", "Zhang_hxBar");
    var Zhang_fill = Zhang_el("div", "Zhang_hxBar__fill");
    Zhang_fill.style.width = Math.round(Zhang_result.sentimentScore * 100) + "%";
    Zhang_bar.appendChild(Zhang_fill);
    Zhang_badges.appendChild(Zhang_bar);

    Zhang_badges.appendChild(
      Zhang_el(
        "span",
        "Zhang_hxScore",
        "情感分 " + Zhang_result.sentimentScore + " · 置信度 " + Zhang_result.confidence
      )
    );
    Zhang_reviewResult.appendChild(Zhang_badges);

    Zhang_reviewResult.appendChild(
      Zhang_el("p", "Zhang_hxSummary", Zhang_result.summary || "（无摘要）")
    );

    if (Zhang_result.aspects.length > 0) {
      Zhang_reviewResult.appendChild(Zhang_sectionTitle("方面词"));
      var Zhang_aspectList = Zhang_el("ul", "Zhang_hxList");

      Zhang_result.aspects.forEach(function (Zhang_aspect) {
        var Zhang_item = Zhang_el("li", "Zhang_hxItem");
        var Zhang_head = Zhang_el("div", "Zhang_hxItem__head");
        Zhang_head.appendChild(Zhang_el("span", "Zhang_hxItem__name", Zhang_aspect.aspect));
        Zhang_head.appendChild(
          Zhang_badge(
            Zhang_aspect.sentiment,
            Zhang_SENTIMENT_TEXT[Zhang_aspect.sentiment] + " " + Zhang_aspect.score
          )
        );
        Zhang_item.appendChild(Zhang_head);

        if (Zhang_aspect.evidence) {
          Zhang_item.appendChild(
            Zhang_el("p", "Zhang_hxItem__evidence", "依据：" + Zhang_aspect.evidence)
          );
        }

        Zhang_aspectList.appendChild(Zhang_item);
      });

      Zhang_reviewResult.appendChild(Zhang_aspectList);
    }

    if (Zhang_result.entities.length > 0) {
      Zhang_reviewResult.appendChild(Zhang_sectionTitle("实体"));
      var Zhang_entityList = Zhang_el("ul", "Zhang_hxList");

      Zhang_result.entities.forEach(function (Zhang_entity) {
        var Zhang_item = Zhang_el("li", "Zhang_hxItem");
        var Zhang_head = Zhang_el("div", "Zhang_hxItem__head");
        Zhang_head.appendChild(Zhang_el("span", "Zhang_hxItem__name", Zhang_entity.name));
        Zhang_head.appendChild(Zhang_el("span", "Zhang_hxItem__meta", Zhang_entity.type));
        Zhang_item.appendChild(Zhang_head);

        if (Zhang_entity.role) {
          Zhang_item.appendChild(
            Zhang_el("p", "Zhang_hxItem__evidence", Zhang_entity.role)
          );
        }

        Zhang_entityList.appendChild(Zhang_item);
      });

      Zhang_reviewResult.appendChild(Zhang_entityList);
    }

    if (Zhang_result.keywords.length > 0) {
      Zhang_reviewResult.appendChild(Zhang_sectionTitle("关键词"));
      var Zhang_tags = Zhang_el("div", "Zhang_hxTags");
      Zhang_result.keywords.forEach(function (Zhang_word) {
        Zhang_tags.appendChild(Zhang_el("span", "Zhang_hxTag", Zhang_word));
      });
      Zhang_reviewResult.appendChild(Zhang_tags);
    }

    Zhang_reviewResult.appendChild(Zhang_sectionTitle("投诉识别"));
    var Zhang_complaint = Zhang_result.complaint;
    var Zhang_complaintText = Zhang_complaint.hasComplaint
      ? "存在投诉 · 类型 " +
        Zhang_complaint.type +
        " · 紧急度 " +
        Zhang_complaint.urgency +
        (Zhang_complaint.evidence ? " · 依据：" + Zhang_complaint.evidence : "")
      : "未识别到明确投诉";

    Zhang_reviewResult.appendChild(
      Zhang_el("p", "Zhang_hxSummary", Zhang_complaintText)
    );

    var Zhang_meta = Zhang_el(
      "p",
      "Zhang_hxItem__meta",
      "模型：" +
        Zhang_payload.meta.model +
        " · 耗时 " +
        Zhang_payload.meta.elapsedMs +
        " ms · 文本 " +
        Zhang_payload.meta.textLength +
        " 字"
    );
    Zhang_reviewResult.appendChild(Zhang_meta);

    Zhang_rawJson(Zhang_reviewResult, Zhang_payload);
    Zhang_reviewResult.scrollTop = 0;
  }

  function Zhang_analyzeReview(Zhang_text) {
    if (Zhang_busy) {
      return;
    }

    Zhang_busy = true;
    Zhang_reviewBtn.disabled = true;
    Zhang_reviewBtn.textContent = "抽取中…";
    Zhang_clear(Zhang_reviewResult);
    Zhang_reviewResult.appendChild(
      Zhang_el("p", "Zhang_hxLoading", "正在调用大模型抽取结构化数据…")
    );

    var Zhang_body = { text: Zhang_text };
    console.log("[发送给大模型] POST /api/harness/analyze", Zhang_body);

    fetch("/api/harness/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Zhang_body)
    })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到大模型数据] /api/harness/analyze", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          Zhang_clear(Zhang_reviewResult);
          Zhang_reviewResult.appendChild(
            Zhang_el("p", "Zhang_hxErr", "抽取失败：" + Zhang_result.msg)
          );
          return;
        }

        Zhang_renderReview(Zhang_result.data);
      })
      .catch(function (Zhang_error) {
        console.error("[评论抽取请求失败]", Zhang_error);
        Zhang_clear(Zhang_reviewResult);
        Zhang_reviewResult.appendChild(
          Zhang_el("p", "Zhang_hxErr", "网络异常：" + Zhang_error.message)
        );
      })
      .then(function () {
        Zhang_busy = false;
        Zhang_reviewBtn.disabled = false;
        Zhang_reviewBtn.textContent = "开始抽取";
      });
  }

  /* ---------------- 图像识别 / OCR ---------------- */

  function Zhang_renderImage(Zhang_payload) {
    var Zhang_result = Zhang_payload.result;
    Zhang_clear(Zhang_imageResult);

    var Zhang_badges = Zhang_el("div", "Zhang_hxBadges");
    Zhang_badges.appendChild(
      Zhang_badge("neutral", Zhang_TYPE_TEXT[Zhang_result.type] || Zhang_result.type)
    );
    Zhang_badges.appendChild(Zhang_badge("neutral", "语言 " + Zhang_result.language));
    Zhang_badges.appendChild(
      Zhang_el("span", "Zhang_hxScore", "耗时 " + Zhang_payload.meta.elapsedMs + " ms")
    );
    Zhang_imageResult.appendChild(Zhang_badges);

    Zhang_imageResult.appendChild(
      Zhang_el("p", "Zhang_hxSummary", Zhang_result.title || "（无标题）")
    );
    Zhang_imageResult.appendChild(
      Zhang_el("p", "Zhang_hxSummary", Zhang_result.description || "")
    );

    Zhang_imageResult.appendChild(Zhang_sectionTitle("OCR 文字"));
    Zhang_imageResult.appendChild(
      Zhang_el("pre", "Zhang_hxOcr", Zhang_result.ocrText || "（图片中未识别到文字）")
    );

    if (Zhang_result.textBlocks.length > 0) {
      Zhang_imageResult.appendChild(
        Zhang_el(
          "p",
          "Zhang_hxItem__meta",
          "文字块 " + Zhang_result.textBlocks.length + " 个"
        )
      );
    }

    if (Zhang_result.objects.length > 0) {
      Zhang_imageResult.appendChild(Zhang_sectionTitle("识别到的对象"));
      var Zhang_objectList = Zhang_el("ul", "Zhang_hxList");

      Zhang_result.objects.forEach(function (Zhang_object) {
        var Zhang_item = Zhang_el("li", "Zhang_hxItem");
        var Zhang_head = Zhang_el("div", "Zhang_hxItem__head");
        Zhang_head.appendChild(Zhang_el("span", "Zhang_hxItem__name", Zhang_object.name));
        Zhang_head.appendChild(
          Zhang_el(
            "span",
            "Zhang_hxItem__meta",
            Zhang_object.category + " · " + Zhang_object.confidence
          )
        );
        Zhang_item.appendChild(Zhang_head);
        Zhang_objectList.appendChild(Zhang_item);
      });

      Zhang_imageResult.appendChild(Zhang_objectList);
    }

    if (Zhang_result.keywords.length > 0) {
      Zhang_imageResult.appendChild(Zhang_sectionTitle("关键词"));
      var Zhang_tags = Zhang_el("div", "Zhang_hxTags");
      Zhang_result.keywords.forEach(function (Zhang_word) {
        Zhang_tags.appendChild(Zhang_el("span", "Zhang_hxTag", Zhang_word));
      });
      Zhang_imageResult.appendChild(Zhang_tags);
    }

    var Zhang_meta = Zhang_el(
      "p",
      "Zhang_hxItem__meta",
      "模型：" +
        Zhang_payload.meta.model +
        " · 文件：" +
        Zhang_payload.meta.fileName +
        " · " +
        Zhang_payload.meta.size +
        " 字节"
    );
    Zhang_imageResult.appendChild(Zhang_meta);

    Zhang_rawJson(Zhang_imageResult, Zhang_payload);
    Zhang_imageResult.scrollTop = 0;
  }

  function Zhang_analyzeImage() {
    if (!Zhang_selectedImage || Zhang_busy) {
      return;
    }

    Zhang_busy = true;
    Zhang_imageBtn.disabled = true;
    Zhang_imageBtn.textContent = "识别中…";
    Zhang_clear(Zhang_imageResult);
    Zhang_imageResult.appendChild(
      Zhang_el("p", "Zhang_hxLoading", "正在调用视觉大模型识别图片…")
    );

    var Zhang_data = new FormData();
    Zhang_data.append("image", Zhang_selectedImage);

    console.log("[发送给大模型] POST /api/vision/analyze", {
      name: Zhang_selectedImage.name,
      size: Zhang_selectedImage.size,
      type: Zhang_selectedImage.type
    });

    fetch("/api/vision/analyze", {
      method: "POST",
      body: Zhang_data
    })
      .then(function (Zhang_response) {
        return Zhang_response.json();
      })
      .then(function (Zhang_result) {
        console.log("[收到大模型数据] /api/vision/analyze", Zhang_result);

        if (Zhang_result.code !== 0 || !Zhang_result.data) {
          Zhang_clear(Zhang_imageResult);
          Zhang_imageResult.appendChild(
            Zhang_el("p", "Zhang_hxErr", "识别失败：" + Zhang_result.msg)
          );
          return;
        }

        Zhang_renderImage(Zhang_result.data);
      })
      .catch(function (Zhang_error) {
        console.error("[图像识别请求失败]", Zhang_error);
        Zhang_clear(Zhang_imageResult);
        Zhang_imageResult.appendChild(
          Zhang_el("p", "Zhang_hxErr", "网络异常：" + Zhang_error.message)
        );
      })
      .then(function () {
        Zhang_busy = false;
        Zhang_imageBtn.disabled = false;
        Zhang_imageBtn.textContent = "识别图片";
      });
  }

  function Zhang_pickImage(Zhang_file) {
    if (!Zhang_file || !/^image\//.test(Zhang_file.type)) {
      Zhang_imageHint.textContent = "请选择图片文件";
      return;
    }

    Zhang_selectedImage = Zhang_file;
    Zhang_imageHint.textContent =
      Zhang_file.name + " · " + (Zhang_file.size / 1024).toFixed(1) + " KB";
    Zhang_clear(Zhang_preview);

    var Zhang_img = Zhang_el("img", "Zhang_hxPreview__img");
    Zhang_img.alt = "待识别的图片预览";
    Zhang_img.src = URL.createObjectURL(Zhang_file);
    Zhang_preview.appendChild(Zhang_img);

    Zhang_imageBtn.disabled = false;
  }

  /* ---------------- 事件绑定 ---------------- */

  Zhang_reviewText.addEventListener("input", function () {
    Zhang_reviewHint.textContent = Zhang_reviewText.value.length + " / 2000";
  });

  Zhang_reviewForm.addEventListener("submit", function (Zhang_event) {
    Zhang_event.preventDefault();

    var Zhang_text = Zhang_reviewText.value.trim();

    if (!Zhang_text) {
      Zhang_reviewText.focus();
      return;
    }

    Zhang_analyzeReview(Zhang_text);
  });

  Zhang_samples.addEventListener("click", function (Zhang_event) {
    var Zhang_target = Zhang_event.target;

    if (Zhang_target && Zhang_target.className.indexOf("Zhang_hxSample") === 0) {
      Zhang_reviewText.value = Zhang_target.textContent;
      Zhang_reviewHint.textContent = Zhang_reviewText.value.length + " / 2000";
      Zhang_reviewText.focus();
    }
  });

  Zhang_imageInput.addEventListener("change", function () {
    if (Zhang_imageInput.files && Zhang_imageInput.files[0]) {
      Zhang_pickImage(Zhang_imageInput.files[0]);
    }
  });

  ["dragenter", "dragover"].forEach(function (Zhang_name) {
    Zhang_drop.addEventListener(Zhang_name, function (Zhang_event) {
      Zhang_event.preventDefault();
      Zhang_drop.className = "Zhang_hxDrop Zhang_hxDrop--over";
    });
  });

  ["dragleave", "drop"].forEach(function (Zhang_name) {
    Zhang_drop.addEventListener(Zhang_name, function (Zhang_event) {
      Zhang_event.preventDefault();
      Zhang_drop.className = "Zhang_hxDrop";
    });
  });

  Zhang_drop.addEventListener("drop", function (Zhang_event) {
    if (Zhang_event.dataTransfer && Zhang_event.dataTransfer.files) {
      Zhang_pickImage(Zhang_event.dataTransfer.files[0]);
    }
  });

  Zhang_imageBtn.addEventListener("click", Zhang_analyzeImage);
})();
