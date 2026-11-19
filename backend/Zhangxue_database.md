# 数据库文档（Zhangxue_database.md）

> 记录规则：每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
> 仅凭本文件即可在新机器上完整重建数据库。
>
> 执行环境：MySQL 8.0.30，字符集 utf8mb4。

---

## 2026-11-19 · 创建数据库与科技新闻表

```sql
CREATE DATABASE IF NOT EXISTS zhihu_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE zhihu_db;

CREATE TABLE IF NOT EXISTS Zhang_news (
  Zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  Zhang_title VARCHAR(120) NOT NULL COMMENT '新闻标题',
  Zhang_summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  Zhang_source VARCHAR(60) NOT NULL COMMENT '新闻来源',
  Zhang_category VARCHAR(30) NOT NULL COMMENT '新闻分类',
  Zhang_publish_time DATETIME NOT NULL COMMENT '发布时间',
  Zhang_views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  PRIMARY KEY (Zhang_id),
  KEY Zhang_idx_publish (Zhang_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻列表';
```

## 2026-11-19 · 插入 10 条科技新闻测试数据

```sql
INSERT INTO Zhang_news
  (Zhang_title, Zhang_summary, Zhang_source, Zhang_category, Zhang_publish_time, Zhang_views)
VALUES
  ('多模态大模型走进课堂，个性化辅导开始规模化落地',
   '多家教育科技企业在本周公布新一代多模态教学模型，可同时理解文字、语音与手写板书，并根据学生的答题过程实时生成讲解步骤。试点学校反馈，课后答疑的平均等待时间从两小时缩短到五分钟以内。',
   '量子位', '人工智能', '2026-11-19 09:20:00', 15842),
  ('新一代折叠屏手机铰链寿命突破 50 万次',
   '供应链消息显示，新一代水滴铰链采用航空级钛合金与自研润滑涂层，实验室折叠寿命首次突破 50 万次，整机厚度进一步下降。厂商表示量产良率已经达到可商用水平。',
   '数码前沿', '消费电子', '2026-11-18 20:05:00', 23811),
  ('8 英寸硅光芯片产线通线，光模块成本有望下降',
   '国内首条 8 英寸硅光芯片产线宣布通线，首批流片良率超过预期。业内预计，随着硅光方案规模化，高速光模块的整体成本将在明年下降约两成。',
   '科技日报', '半导体', '2026-11-18 14:32:00', 9634),
  ('国产开源数据库发布年度路线图，聚焦云原生与向量检索',
   '社区公布的路线图显示，下一版本将重点优化云原生弹性伸缩、分布式事务性能以及向量检索能力，并计划开放更多可观测性指标，方便企业在混合云环境中迁移。',
   'InfoQ', '开源技术', '2026-11-17 11:08:00', 7215),
  ('可重复使用火箭完成第十次垂直回收试验',
   '本次试验中，一子级在完成分离后准确返回预定着陆区，落地偏差小于三米。研制团队表示，后续将开展更高轨道、更长滑行时间的回收验证，为常态化复用积累数据。',
   '中国航天报', '航空航天', '2026-11-16 18:40:00', 31276),
  ('固态电池中试线投产，能量密度提升至 400Wh/kg',
   '该中试线采用硫化物电解质路线，首批电芯能量密度达到 400Wh/kg，循环寿命超过一千次。企业计划先在高端电动车与无人机场景小批量装车验证。',
   '新能源观察', '新能源', '2026-11-15 10:15:00', 18452),
  ('零信任架构落地加速，企业身份治理成为建设重点',
   '最新行业调研显示，超过六成受访企业已启动零信任改造，其中身份治理与细粒度权限控制投入增长最快。安全团队普遍将工作负载身份纳入统一管理范围。',
   '安全客', '网络安全', '2026-11-14 16:22:00', 6421),
  ('人形机器人进入汽车工厂实训，单班作业效率提升 30%',
   '在某汽车总装车间，人形机器人已承担物料搬运与质检辅助任务。连续四周的实训数据显示，单班作业效率提升约 30%，下一步将扩展到更多工位。',
   '机器人产业网', '机器人', '2026-11-13 09:45:00', 20983),
  ('边缘云节点下沉至县域，低时延应用加速普及',
   '随着边缘云节点向县域下沉，工业质检、远程医疗等低时延应用的网络往返时间明显下降。运营商表示，年内还将新增一批节点，并开放统一的调度接口。',
   '云头条', '云计算', '2026-11-12 15:30:00', 5310),
  ('高性能 RISC-V 处理器核发布，主频突破 3GHz',
   '新发布的处理器核采用乱序多发射架构，在标准测试中主频突破 3GHz，并支持完整的向量扩展指令集。多家芯片厂商已开始评估将其用于边缘计算与车载场景。',
   '芯智讯', '芯片', '2026-11-11 13:10:00', 14760);
```

## 验证语句

```sql
SELECT COUNT(*) AS total FROM Zhang_news;
-- 结果：10
```

---

## 2026-11-19 · 创建科技图文表

```sql
USE zhihu_db;

CREATE TABLE IF NOT EXISTS Zhang_gallery (
  Zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  Zhang_title VARCHAR(120) NOT NULL COMMENT '图文标题',
  Zhang_desc VARCHAR(400) NOT NULL COMMENT '图文描述',
  Zhang_image VARCHAR(600) NOT NULL COMMENT '图片地址',
  Zhang_tag VARCHAR(30) NOT NULL COMMENT '图文标签',
  Zhang_likes INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  Zhang_create_time DATETIME NOT NULL COMMENT '创建时间',
  PRIMARY KEY (Zhang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技图文列表';
```

## 2026-11-19 · 插入 8 条科技图文测试数据

```sql
INSERT INTO Zhang_gallery
  (Zhang_title, Zhang_desc, Zhang_image, Zhang_tag, Zhang_likes, Zhang_create_time)
VALUES
  ('AI 算力中心的一天',
   '成排的机柜在蓝色冷光中持续运转，散热风扇的低鸣几乎盖过脚步声。这里承载着大模型训练最耗时的那些夜晚。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20AI%20data%20center%20with%20glowing%20blue%20server%20racks%2C%20cinematic%20lighting%2C%20photorealistic&image_size=landscape_4_3',
   '人工智能', 1286, '2026-11-19 10:05:00'),
  ('指甲盖上的城市',
   '在显微镜下，芯片的金属互连层层叠叠，像一座被压缩在指甲盖里的城市，每一层布线都精确到纳米。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=macro%20shot%20of%20a%20silicon%20chip%20die%20with%20intricate%20circuits%2C%20blue%20glow%2C%20photorealistic&image_size=landscape_4_3',
   '半导体', 964, '2026-11-18 19:20:00'),
  ('回收火箭的归途',
   '一子级在完成分离后调头返回，着陆腿展开的瞬间扬起尘土。可重复使用，正在把发射成本一点点压下来。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reusable%20rocket%20landing%20on%20a%20launch%20pad%20at%20dusk%2C%20dramatic%20sky%2C%20photorealistic&image_size=landscape_4_3',
   '航空航天', 2417, '2026-11-17 21:40:00'),
  ('车间里的新同事',
   '总装车间里，人形机器人承担起搬运与质检辅助任务。它不需要工牌，但同样要打卡上班。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=humanoid%20robot%20working%20in%20a%20modern%20car%20factory%2C%20industrial%20lighting%2C%20photorealistic&image_size=landscape_4_3',
   '机器人', 1735, '2026-11-16 14:15:00'),
  ('固态电池实验室',
   '洁净间里，工程师正在测试新一代固态电芯。更高的能量密度背后，是无数次失败与重新配比。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scientist%20in%20a%20cleanroom%20holding%20solid%20state%20battery%20cells%2C%20blue%20light%2C%20photorealistic&image_size=landscape_4_3',
   '新能源', 842, '2026-11-15 09:30:00'),
  ('县域里的边缘节点',
   '集装箱式边缘数据中心被部署到县城，工业质检与远程医疗的数据不再需要长途跋涉。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20edge%20data%20center%20container%20in%20a%20county%20town%20at%20dusk%2C%20network%20cables%2C%20photorealistic&image_size=landscape_4_3',
   '云计算', 597, '2026-11-14 18:00:00'),
  ('折叠屏的铰链',
   '钛合金铰链在微距镜头下显出精密的齿轮结构，每一次开合都是一次微米级的配合。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=macro%20shot%20of%20a%20titanium%20folding%20phone%20hinge%2C%20precision%20engineering%2C%20photorealistic&image_size=landscape_4_3',
   '消费电子', 1320, '2026-11-13 11:25:00'),
  ('零信任的边界',
   '当网络边界消失，身份成为新的围墙。每一次访问请求，都要重新证明自己值得信任。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20network%20security%20visualization%20with%20glowing%20shields%20and%20connected%20nodes%2C%20dark%20blue%2C%20high%20detail&image_size=landscape_4_3',
   '网络安全', 463, '2026-11-12 16:50:00');
```

## 验证语句

```sql
SELECT COUNT(*) AS total FROM Zhang_gallery;
-- 结果：8
```
