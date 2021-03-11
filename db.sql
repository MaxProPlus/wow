# CREATE SCHEMA wow COLLATE utf8mb4_unicode_ci;
# CREATE USER 'wow'@'localhost' IDENTIFIED BY 'wow';
# GRANT ALL ON wow.* TO 'wow'@'localhost';
# USE wow;

create table if not exists account
(
    id int unsigned auto_increment comment 'Identifier'
        primary key,
    username varchar(32) default '' not null,
    sha_pass_hash varchar(40) default '' not null,
    sessionkey varchar(80) default '' not null,
    v varchar(64) default '' not null,
    s varchar(64) default '' not null,
    totp_secret varbinary(128) null,
    email varchar(255) default '' not null,
    reg_mail varchar(255) default '' not null,
    joindate timestamp default current_timestamp() not null,
    last_ip varchar(15) default '127.0.0.1' not null,
    last_attempt_ip varchar(15) default '127.0.0.1' not null,
    failed_logins int unsigned default 0 not null,
    locked tinyint unsigned default 0 not null,
    lock_country varchar(2) default '00' not null,
    last_login timestamp null,
    online tinyint unsigned default 0 not null,
    expansion tinyint unsigned default 2 not null,
    mutetime bigint default 0 not null,
    mutereason varchar(255) default '' not null,
    muteby varchar(50) default '' not null,
    locale tinyint unsigned default 0 not null,
    os varchar(3) default '' not null,
    recruiter int unsigned default 0 not null,
    constraint idx_username
        unique (username)
)
    comment 'Account System' charset=utf8;

create table ar_permission
(
    id int unsigned auto_increment
        primary key,
    name varchar(32) default '' not null,
    constraint ar_permission_name_uindex
        unique (name)
)
    comment 'Разрешения';

create table ar_role
(
    id int unsigned auto_increment
        primary key,
    name varchar(30) default '' not null
)
    comment 'Роли';

create table ar_role_permission
(
    id int unsigned auto_increment
        primary key,
    id_role int unsigned not null,
    id_permission int unsigned not null,
    constraint ar_role_permission_ar_permission_id_fk
        foreign key (id_permission) references ar_permission (id)
            on update cascade on delete cascade,
    constraint ar_role_permission_ar_role_id_fk
        foreign key (id_role) references ar_role (id)
            on update cascade on delete cascade
)
    comment 'Таблица связа разрешений с ролями';

create table ticket_type
(
    id int unsigned auto_increment
        primary key,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null,
    description text default '' not null
);

create table user
(
    id int unsigned auto_increment comment 'Identifier'
        primary key,
    id_account int unsigned null,
    url_avatar varchar(150) default '' not null,
    nickname varchar(50) default 'no_name' not null,
    link_ds varchar(150) default '' not null,
    link_mail varchar(150) default '' not null,
    link_vk varchar(150) default '' not null,
    link_tg varchar(150) default '' not null,
    constraint user_account_id_fk
        foreign key (id_account) references account (id)
            on update set null on delete set null
)
    comment 'Account System' charset=utf8;

create table ar_user_role
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    id_role int unsigned not null,
    constraint ar_user_role_ar_role_id_fk
        foreign key (id_role) references ar_role (id)
            on update cascade on delete cascade,
    constraint ar_user_role_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Таблица связей аккаунтов и ролей';

create table article
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null comment 'Название новости',
    short_description text default 'Рождение героя' not null comment 'Анонс новости',
    description text default '' not null comment 'Описание',
    closed tinyint(1) default 0 not null comment 'Закрыт(материал будет доступен только автору)',
    hidden tinyint(1) default 0 not null comment 'Скрыть из общих разделов',
    comment tinyint(1) default 0 not null comment '0 - разрешить, 1 - запретить',
    style text default '' not null comment 'CSS - стили',
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null comment 'Признак удаления',
    constraint article_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Новости';

create table article_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_article int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint article_comment_article_id_fk
        foreign key (id_article) references article (id)
            on update cascade on delete cascade,
    constraint article_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table `character`
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null comment 'Полное имя персонажа',
    nickname varchar(150) default '' not null comment 'Игровое имя',
    short_description text default 'Рождение героя' not null comment 'Девиз персонажа',
    race varchar(150) default '' not null comment 'Раса',
    nation varchar(150) default '' not null comment 'Народность',
    territory varchar(150) default '' not null comment 'Места пребывания',
    age tinyint default 0 not null comment 'Возраст',
    class varchar(150) default '' not null comment 'Класс',
    occupation varchar(150) default '' not null comment 'Род занятий',
    religion varchar(150) default '' not null comment 'Верования',
    languages varchar(150) default '' not null comment 'Знание языков',
    description text default '' not null comment 'Внешность и характер',
    history text default '' not null comment 'История персонажа',
    more text default '' not null comment 'Дополнительные сведения',
    sex tinyint(1) default 0 not null comment 'Пол. 0-не указан, 1-женский, 2-мужской.',
    status tinyint(1) default 0 not null comment 'Статус. 0-жив, 1-мертв, 2-пропал.',
    active tinyint(1) default 0 not null comment 'Активность. 0 - отыгрыш еще не начат, 1 - в поиске отыгрыша, 2 - персонаж отыгрывается, 3-отыгрыш завершен',
    closed tinyint(1) default 0 not null comment 'Закрыт(материал будет доступен только автору)',
    hidden tinyint(1) default 0 not null comment 'Скрыть из общих разделов',
    comment tinyint(1) default 0 not null comment '0 - разрешить, 1 - запретить',
    style text default '' not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null comment 'Признак удаления',
    constraint character_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Персонажи';

create table character_coauthor
(
    id int unsigned auto_increment
        primary key,
    id_character int unsigned not null,
    id_user int unsigned not null,
    constraint character_coauthor_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint character_coauthor_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table character_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_character int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint character_comment_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint character_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table character_to_character
(
    id int unsigned auto_increment
        primary key,
    id_character int unsigned not null,
    id_character_link int unsigned not null,
    constraint character_to_character_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint character_to_character_character_id_fk_2
        foreign key (id_character_link) references `character` (id)
            on update cascade on delete cascade
);

create table feedback
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    role varchar(150) default '' not null,
    constraint feedback_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Обратная связь';

create table forum
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null,
    description varchar(150) default '' not null,
    short_description text default '' not null,
    rule text default '' not null comment 'Важная информация',
    style text default '' not null,
    closed tinyint(1) default 0 not null,
    hidden tinyint(1) default 0 not null,
    comment tinyint(1) default 0 not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint forum_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Форумы';

create table forum_coauthor
(
    id int unsigned auto_increment
        primary key,
    id_forum int unsigned not null,
    id_user int unsigned not null,
    constraint forum_coauthor_forum_id_fk
        foreign key (id_forum) references forum (id)
            on update cascade on delete cascade,
    constraint forum_coauthor_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table forum_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_forum int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint forum_comment_forum_id_fk
        foreign key (id_forum) references forum (id)
            on update cascade on delete cascade,
    constraint forum_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table guild
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null comment 'Название гильдии',
    game_title varchar(150) default '' not null comment 'Название гильдии в игре',
    ideology varchar(150) default '' not null,
    short_description varchar(150) default '' not null comment 'Анонс',
    description text default '' not null comment 'Описание и история',
    rule text default '' not null comment 'Условия и правила',
    more text default '' not null comment 'Дополнительные сведения',
    status tinyint(1) default 0 not null comment 'Статус. 0-активна, 1-скоро открытие, 2-распущена',
    kit tinyint(1) default 0 not null comment 'Активность. 0 - открыт, 1 - закрыт, 2 - временно прекращен',
    closed tinyint(1) default 0 not null comment 'Закрыт(материал будет доступен только автору)',
    hidden tinyint(1) default 0 not null comment 'Скрыть из общих разделов',
    comment tinyint(1) default 0 not null comment '0 - разрешить, 1 - запретить',
    style text default '' not null comment 'CSS-стили',
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null comment 'Признак удалении',
    constraint guild_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Гильдии';

create table guild_coauthor
(
    id int unsigned auto_increment
        primary key,
    id_guild int unsigned not null,
    id_user int unsigned not null,
    constraint guild_coauthor_guild_id_fk
        foreign key (id_guild) references guild (id)
            on update cascade on delete cascade,
    constraint guild_coauthor_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table guild_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_guild int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint guild_comment_guild_id_fk
        foreign key (id_guild) references guild (id)
            on update cascade on delete cascade,
    constraint guild_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table guild_to_character
(
    id int unsigned auto_increment
        primary key,
    id_guild int unsigned not null,
    id_character int unsigned not null,
    constraint guild_to_character_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint guild_to_character_guild_id_fk
        foreign key (id_guild) references guild (id)
            on update cascade on delete cascade
);

create table report
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' null,
    title varchar(150) default '' not null,
    short_description varchar(150) default '' null,
    description text default '' not null,
    rule text default '' not null,
    closed tinyint(1) default 0 not null,
    hidden tinyint(1) default 0 not null,
    comment tinyint(1) default 0 not null,
    style text default '' not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint report_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Отчеты / логи';

create table report_coauthor
(
    id int unsigned auto_increment
        primary key,
    id_report int unsigned not null,
    id_user int unsigned not null,
    constraint report_coauthor_report_id_fk
        foreign key (id_report) references report (id)
            on update cascade on delete cascade,
    constraint report_coauthor_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table report_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_report int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint report_comment_report_id_fk
        foreign key (id_report) references report (id)
            on update cascade on delete cascade,
    constraint report_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table report_to_character
(
    id int unsigned auto_increment
        primary key,
    id_report int unsigned not null,
    id_character int unsigned not null,
    constraint report_to_character_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint report_to_character_report_id_fk
        foreign key (id_report) references report (id)
            on update cascade on delete cascade
);

create table report_to_guild
(
    id int unsigned auto_increment
        primary key,
    id_report int unsigned not null,
    id_guild int unsigned not null,
    constraint report_to_guild_guild_id_fk
        foreign key (id_guild) references guild (id)
            on update cascade on delete cascade,
    constraint report_to_guild_report_id_fk
        foreign key (id_report) references report (id)
            on update cascade on delete cascade
);

create table story
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    url_avatar varchar(150) default '' not null,
    title varchar(150) default '' not null comment 'Название сюжета',
    date_start date default current_timestamp() not null comment 'Дата начала',
    `period` varchar(150) default '' not null comment 'Планируемый период отыгрыша',
    short_description varchar(150) default '' not null comment 'Анонс',
    description text default '' not null comment 'Описание сюжета',
    rule text default '' not null comment 'Условия и правила',
    more text default '' not null comment 'Дополнительные сведения',
    status tinyint(1) default 0 not null comment 'Статус. 0-еще не начат, 1-активен, 2-отложен, 3-завершен',
    closed tinyint(1) default 0 not null comment 'Закрыт(материал будет доступен только автору)',
    hidden tinyint(1) default 0 not null comment 'Скрыть из общих разделов',
    comment tinyint(1) default 0 not null comment '0 - разрешить, 1 - запретить',
    style text default '' not null comment 'CSS-стили',
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null comment 'Признак удалении',
    constraint story_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Сюжеты';

create table report_to_story
(
    id int unsigned auto_increment
        primary key,
    id_report int unsigned not null,
    id_story int unsigned not null,
    constraint report_to_story_report_id_fk
        foreign key (id_report) references report (id)
            on update cascade on delete cascade,
    constraint report_to_story_story_id_fk
        foreign key (id_story) references story (id)
            on update cascade on delete cascade
);

create table story_coauthor
(
    id int unsigned auto_increment
        primary key,
    id_story int unsigned not null,
    id_user int unsigned not null,
    constraint story_coauthor_story_id_fk
        foreign key (id_story) references story (id)
            on update cascade on delete cascade,
    constraint story_coauthor_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table story_comment
(
    id int unsigned auto_increment
        primary key,
    text text default '' not null,
    id_user int unsigned not null,
    id_story int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint story_comment_story_id_fk
        foreign key (id_story) references story (id)
            on update cascade on delete cascade,
    constraint story_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table story_to_character
(
    id int unsigned auto_increment
        primary key,
    id_story int unsigned not null,
    id_character int unsigned not null,
    constraint story_to_character_character_id_fk
        foreign key (id_character) references `character` (id)
            on update cascade on delete cascade,
    constraint story_to_character_story_id_fk
        foreign key (id_story) references story (id)
            on update cascade on delete cascade
);

create table story_to_guild
(
    id int unsigned auto_increment
        primary key,
    id_story int unsigned not null,
    id_guild int unsigned not null,
    constraint story_to_guild_guild_id_fk
        foreign key (id_guild) references guild (id)
            on update cascade on delete cascade,
    constraint story_to_guild_story_id_fk
        foreign key (id_story) references story (id)
            on update cascade on delete cascade
);

create table ticket
(
    id int unsigned auto_increment
        primary key,
    title varchar(150) default '' not null,
    id_ticket_type int unsigned default 0 not null,
    text text default '' not null,
    status tinyint default 0 not null,
    id_user int unsigned default 0 not null,
    id_user_moder int unsigned null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    constraint ticket_ticket_type_id_fk
        foreign key (id_ticket_type) references ticket_type (id)
            on update cascade on delete cascade,
    constraint ticket_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table ticket_comment
(
    id int unsigned auto_increment
        primary key,
    text longtext default '' not null,
    id_user int unsigned not null,
    id_ticket int unsigned not null,
    created_at timestamp default current_timestamp() not null,
    updated_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint ticket_comment_ticket_id_fk
        foreign key (id_ticket) references ticket (id)
            on update cascade on delete cascade,
    constraint ticket_comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table token
(
    id int auto_increment
        primary key,
    id_user int unsigned not null,
    text varchar(40) not null,
    ip varchar(25) default '' not null,
    date_init timestamp default current_timestamp() not null,
    constraint token_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create table user_email
(
    id int unsigned auto_increment
        primary key,
    id_user int unsigned not null,
    email varchar(150) default '' not null,
    token varchar(150) default '' not null,
    created_at timestamp default current_timestamp() not null,
    is_remove tinyint(1) default 0 not null,
    constraint user_email_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
)
    comment 'Таблица подтверждения нового email';

create table user_reg
(
    id int unsigned auto_increment
        primary key,
    username varchar(150) default '' not null,
    password varchar(40) default '' not null,
    email varchar(150) default '' not null,
    token varchar(150) default '' not null,
    created_at timestamp default current_timestamp() not null,
    nickname varchar(150) default '' not null,
    is_remove tinyint(1) default 0 not null
);

INSERT INTO ar_permission (id, name) VALUES (1, 'ARTICLE_MODERATOR');
INSERT INTO ar_permission (id, name) VALUES (2, 'COMMENT_MODERATE');
INSERT INTO ar_permission (id, name) VALUES (3, 'FEEDBACK_MODERATOR');
INSERT INTO ar_permission (id, name) VALUES (4, 'TICKET_MODERATOR');

INSERT INTO ar_role (id, name) VALUES (1, 'Admin');

INSERT INTO ar_role_permission (id_role, id_permission) VALUES (1, 1);
INSERT INTO ar_role_permission (id_role, id_permission) VALUES (1, 2);
INSERT INTO ar_role_permission (id_role, id_permission) VALUES (1, 3);
INSERT INTO ar_role_permission (id_role, id_permission) VALUES (1, 4);
