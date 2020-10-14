import React, {FC} from "react"
import InfoBlock from "../../../components/show/InfoBlock"
import PageTitle from "../../../components/pageTitle/PageTitle"
import icon from './img/icon.svg'
import iconAbout from './img/about.svg'
import iconChat from './img/chat.svg'
import iconComm from './img/comm.svg'
import iconPurpose from './img/purpose.svg'
import iconRole from './img/role.svg'

// Страница правил
const RulePage: FC = () => {

    return (
        <>
            <PageTitle title="ПРАВИЛА И СОГЛАШЕНИЯ" icon={icon}/>
            <div>
                <InfoBlock icon={iconAbout} title="О проекте"><span
                    className="color-1">"EQUILIBRIUM"</span> является частным
                    игровым сервером для организации и проведения
                    ролевой игры по мотивам вселенной Warcraft, используя инструменты, предоставленные проектом. Команда
                    проекта - волонтёры и добровольцы, которые развивают проект в меру собственных сил и свободного
                    времени.
                </InfoBlock>

                <InfoBlock icon={iconPurpose} title="Цели и виды взыскании">
                    <p className="color-1">ЦЕЛИ ПРОЕКТА:</p>
                    <ul>
                        <li>Подготовка и проведение ролевой игры;</li>
                        <li>Демонстрация творчества, связанного с ролевой игрой;</li>
                        <li>Знакомство и координация игроков, заинтересованных в ролевой игре на проекте;</li>
                        <li>Обмен знаниями и мнениями по истории World of Warcraft, модкрафту и о ролевой игре как
                            таковой;
                        </li>
                    </ul>

                    <p className="color-1">ВИДЫ ВЗЫСКАНИИ: </p>
                    <ul>
                        <li>Предупреждение (не накладывает ограничений на доступ, но записывается в учёт
                            нарушений-рецидивов);
                        </li>
                        <li>Бан персонажа (запрет на отыгрыш конкретным персонажем, продолжать игру другими персонажами
                            -
                            можно);
                        </li>
                        <li>Бан аккаунта (Бан распространяется на все аккаунты игрока и означает полный запрет на
                            использование заблокированного ресурса, т.е. сайта/игры/Discord-а игроком, независимо от
                            того,
                            заблокированы ли его мультиаккаунты технически);
                        </li>
                    </ul>

                    <p className="color-1">ОТЯГЧАЮЩИЕ ОБСТОЯТЕЛЬСТВА:</p>
                    <ul>
                        <li>Рецидив (повторное нарушение);</li>
                        <li>Рофл (игрок нарушает ради шутки, увеселения своей компании или окружающих, ради веселых
                            скриншотов и т.п.);
                        </li>
                        <li>Комплексное нарушение правил (одновременно несколько нарушений);</li>
                        <li>Споры, хамство, пререкания (как по отношению к игрокам, так и к мастерам);</li>
                        <li>Намеренное введение в заблуждение при разборе спорной ситуации;</li>
                        <li>Спекуляция правилами и попытки трактовки в свою пользу (намеренный поиск лазеек и недочетов
                            в
                            правилах, чтобы выйти сухим из воды);
                        </li>
                    </ul>

                    <p className="color-1">СМЯГЧАЮЩИЕ ОБСТОЯТЕЛЬСТВА:</p>
                    <ul>
                        <li>Игрок идет на контакт, не пререкается, ведет себя уважительно и воспитанно по отношению к
                            мастерам и другим игрокам в процессе разбора конфликтной ситуации (кроме случаев рецидива);
                        </li>
                        <li>Игрок - новичок, нарушил по-невнимательности и проявляет готовность к обучению;</li>
                        <li>Игрок был спровоцирован, либо повелся на “агрессивное настроение” зачинщика конфликтной
                            ситуации
                            (кроме случаев рецидива);
                        </li>
                        <li>Игрок был намеренно введен в заблуждение другим нарушителем (гильд-лидер позвал на ганк под
                            видом ивента и т.п.).
                        </li>
                        <li>Игрок является активным ведущим, на постоянной основе организует и проводит ролевую игру для
                            множества игроков на протяжении длительного времени;
                        </li>
                    </ul>

                    <i>
                        <p>“ Использование ресурсов проекта для прочих целей без согласования с владельцем проекта
                            категорически
                            запрещено! ”</p>

                        <p>Решение о том, нарушает ли действие игрока правила проекта и какой вид наказания применить,
                            выносится
                            командой в каждом случае индивидуально, с учётом отягчающих и смягчающих обстоятельств.</p>

                        <p>Если конфликт между игроками не может быть улажен самостоятельно, в спорной ситуации можно
                            обратиться
                            к свободному мастеру проекта, но его решение будет окончательным и обязательным к исполнению
                            всеми
                            сторонами конфликта (даже если стороны передумали и решили договориться). </p>
                    </i>
                </InfoBlock>

                <InfoBlock icon={iconComm} title="Об общении и использовании материалов">
                    <p><span className="color-1">2.1) </span>На нашем проекте мы придерживаемся свободного, но
                        пристойного общения. Не допускайте оскорблений и вульгарного общения в общих чатах ресурсов
                        проекта.
                    </p>
                    <p><span className="color-1">2.2) </span>На проекте запрещены любые действия и публикации
                        следующего характера: порнография и эротика в общедоступных ресурсах проекта; проявления расизма
                        и
                        национализма; пропаганда насилия; оскорбление религий и верований; пропаганда наркотиков и
                        противозаконных действий; пропаганда терроризма; оскорбление по мотивам сексуальной ориентации;
                        угрозы в реальной жизни; разглашение личной информации; размещение ссылок на вредоносные
                        программы,
                        мошенничество, хакерство.</p>
                    <p className="color-1">2.3) ЗАПРЕЩЕНЫ:</p>
                    <ul>
                        <li>Оскорбления в адрес других игроков, а также админов в общих чатах дискорда проекта,
                            вконтакте и
                            игры. В том числе не одобряется “дружеское” оскорбление игроков друг другом, даже если они
                            сами
                            его таковым не считают.
                        </li>
                        <li>Особенно серьезным нарушением являются постоянные нападки, травля, проявление агрессии к
                            конкретным личностями;
                        </li>
                        <li>Клевета, лжесвидетельство. Нарочная попытка повлиять на решение мастеров по какому-либо
                            вопросу,
                            а также предоставление заведомо ложной информации и доказательств;
                        </li>
                        <li>Намеренная провокация массовых беспорядков на ресурсах проекта, а также разжигание ссор
                            между
                            участниками проекта;
                        </li>
                    </ul>
                    <p><span className="color-1">2.4) </span>На всех ресурсах проекта запрещены спам (в том
                        числе
                        и слабосвязанными с ролевой игрой картинками, мемами, видео) и не согласованная с руководством
                        проекта реклама. </p>
                    <p className="color-1">2.5) ЗАПРЕЩАЕТСЯ ПЛАГИАТ:</p>

                    <div className="ml-3">
                        <p><span className="color-1">2.5.1) </span>Запрещён плагиат текста в любом виде. Если
                            пользователь сайта будет замечен в плагиате, может последовать наказание вплоть до
                            бессрочной
                            блокировки аккаунта.</p>
                        <p><span className="color-1">2.5.2) </span>Запрещён плагиат css-кода со страниц
                            проекта в
                            любом виде без соглашения автора кода.</p>

                        <ul>
                            <li>Плагиатом считается полное копирование кода/частичное копирование кода/использование
                                чужого
                                шаблона кода без предварительного согласия автора кода.
                            </li>
                            <li>Плагиатом не считается полное копирование кода/частичное копирование кода/использование
                                чужого шаблона кода с согласия автора, по оговоренным лично с ним условиям. Если не все
                                условия были выполнены - согласие автора считается недействительным.
                            </li>
                            <li>Также в анкете запрещено использовать чужие визуальные элементы (иконки, рамки,
                                разделители,
                                прочие декоративные элементы), которые создатель материала на сайте указал как
                                авторские.
                                Поскольку речь идет о творческой работе, то каждый подобный случай будет рассматриваться
                                командой коллегиально для вынесения более объективного решения.
                            </li>
                        </ul>
                    </div>
                </InfoBlock>

                <InfoBlock icon={iconChat} title="Об игровых чатах, имуществе и отыгрыше 18+">
                    <p className="color-1">Не переносите личные чувства в ролевую игру и обратно. В игре
                        встречаются персонажи, а не игроки. Надо четко разделять отношения персонажей в игре и между
                        игроками ирл.</p>

                    <p><span className="color-1">3.1) </span>Ролевыми каналами чата являются канал /сказать,
                        /эмоция, /крик, а также глобальные каналы для подачи ролевых объявлений. В этих чатах запрещено
                        общение вне роли и спам повторяющимся сообщениями.
                        Для решения спорных ситуаций следует использовать неролевые каналы чата, личные сообщения,
                        каналы
                        группы и рейда. </p>

                    <div className="ml-3">
                        <p><span className="color-1">3.1.1) </span>Запрещён плагиат текста в любом виде. Если
                            пользователь сайта будет замечен в плагиате, может последовать наказание вплоть до
                            бессрочной
                            блокировки аккаунта.</p>
                    </div>

                    <p><span className="color-1">3.2) </span>Запрещён отыгрыш процесса насилия над персонажем
                        (шок-контент, пытки), непристойный отыгрыш и любой отыгрыш 18+ без согласования с игроком -
                        владельцем персонажа.</p>
                    <div className="ml-3">
                        <p><span className="color-1">3.2.1) </span>В случае игровой необходимости, но при
                            несогласии автора отыгрывать такого рода контент - процесс пропускается и игроку сообщаются
                            последствия в пристойной форме.</p>
                        <p><span className="color-1">3.2.2) </span>В случае, если отыгрыш насилия не
                            обусловлен
                            сюжетной необходимостью и не согласован с владельцем персонажа, либо в процессе отыгрыша
                            были
                            нарушены другие правила проекта - игрок вправе игнорировать такого рода отыгрыш и его
                            последствия.</p>
                    </div>
                    <p><span className="color-1">3.3) </span>Запрещён отыгрыш шок-контента, а также контента
                        18+ в
                        ролевых каналах чата. Используйте для такого отыгрыша групповой и личный чат. </p>
                    <p><span className="color-1">3.4) </span>Всё механическое имущество Вашего персонажа
                        принадлежит только Вам - никто не вправе забирать у Вас предметы/валюту, даже в случае, если это
                        обыгрывается как грабеж/мародёрство.</p>
                    <p><span className="color-1">3.5) </span>В отыгрыше запрещена обсценная лексика (т.е.
                        современный русский мат, вульгаризмы, мемы и современный жаргон) на общих полигонах и в ролевых
                        каналах чата, а мат запрещен даже в неролевых чатах.</p>

                    <div className="ml-3">
                        <p><span className="color-1">3.5.1) </span>Правило может изменяться в рамках отдельных
                            одобренных администрацией полигонов и рп-центров.</p>
                        <p><span className="color-1">3.5.2) </span>Обратите внимание, что влияющие на отыгрыш
                            предметы должны быть либо согласованы между всеми участниками отыгрыша, либо тем или иным
                            образом существовать механически (Например, важные документы, опознавательные знаки, письма
                            с
                            приказами и т.д.).</p>
                    </div>

                    <p> className="color-1"ПРИМЕЧАНИЕ: Если Вашему персонажу упал на ногу молоток, есть
                        множество
                        различных способов выразить свое отношение к подобному, не прибегая к подзаборному мату из
                        реальной
                        жизни.</p>
                </InfoBlock>

                <InfoBlock icon={iconRole} title="Об отыгрыше роли и поведении внутри игры">
                    <p><span className="color-1">4.1) </span>Запрещён саботаж отыгрыша и неролевое поведение
                        (кроме стартовой зоны). Намеренная попытка помешать ролевой игре неролевыми шутками, приколами,
                        "рофлами", а также целенаправленные попытки испортить ролевую игру другим игрокам неролевыми
                        методами - расстановкой объектов, прыжками, "спамом" эмоций, неролевыми сообщениями и т.д.</p>
                    <p><span className="color-1">4.2) </span>Отыгрыш на основном полигоне персонажа,
                        кардинально
                        не вписывающегося в реалии Warcraft и нарушающего атмосферу мира, может быть признан неролевым
                        поведением.</p>
                    <p><span className="color-1">4.3) </span>Запрещён отыгрыш лоровыми личностями любых
                        сеттингов
                        (Артас, Цири, Кэрриган, Фродо и т.п.).</p>
                    <p><span className="color-1">4.4) </span>Запрещены к использованию неролевые и "рофельные"
                        имена с мемами и отсылками, такие как: Лехадуротар, Путын, Вождьгаррош, Варриан12. Имена
                        известных
                        персонажей из фильмов, книг, игр, комиксов и т.д, имена, фамилии не подходящие сеттингу World of
                        Warcraft</p>
                    <p><span className="color-1">4.5) </span>Запрещена намеренная остановка отыгрыша при
                        отсутствии нарушения правил и намеренный уход в режим AFK/DnD, а также выход из игры во время
                        активной игры, без оповещения других участников.</p>
                    <p><span className="color-1">4.6) </span>Чрезмерное описание мыслей и эмоций, которые
                        окружающие персонажи не могут прочесть или увидеть (ввиду отсутствия телепатических
                        способностей)
                        является злоупотреблением, а провокационные и оскорбительные отписи мыслей - нарушением.</p>

                    <div className="ml-3">
                        <p><span className="color-1">4.6.1) </span>Отыгрыш действий/реакций/ощущений других
                            персонажей, несогласованный с их владельцем, также является нарушением.</p>
                    </div>

                    <p><span className="color-1">4.7) </span>Запрещено создание персонажей в целях мести -
                        т.е.
                        создание новых персонажей членов семьи/организации/знакомых/друзей и отыгрыш за них
                        мести/преследования персонажей, которые до этого убили/обидели другого вашего персонажа или
                        персонажей игрока из вашего окружения.</p>
                    <p><span className="color-1">4.8) </span>Запрещено “заманивание” в игру по ООС-мотивам и
                        намеренным введением в заблуждение с целью убийства, запрещено аналогичное заманивание в
                        гильд-холлы, правила которых могут отличаться от правил основного полигона.</p>
                    <p><span className="color-1">4.9) </span>Запрещён метагейм (получение и использование в
                        отыгрыше информации полученной неролевым путём и никаким образом не отыгранной). В случае иных
                        нарушений, использование метаигровой информации может также служить дополнительным отягчающим
                        обстоятельством.</p>

                    <div className="ml-3">
                        <p><span className="color-1">4.9.1) </span>Обратите внимание: при возникновении
                            конфликтной ситуации, вызванной внезапным вводом персонажа в отыгрыш, даже если по логике он
                            мог
                            там быть, но пришёл уже после начала отыгрыша ситуации - такое несогласованное со всеми
                            участниками появление может быть признано метагеймом. Исключение возможно в рамках
                            одобренных
                            сюжетов и на территориях гилдхаузов.</p>
                    </div>
                    <p><span className="color-1">4.10) </span>Избегайте павергейма, (PowerGaming (PG)) -
                        отыгрыш
                        действий, заведомо превосходящих возможности персонажа. </p>
                    <hr/>
                    <ul>
                        <p className="color-1">НЕСКОЛЬКО ПРИМЕРОВ:</p>
                        <li>Прямое нападение игрока объективно не имеющего шанса на победу на группу вооруженных людей,
                            с
                            последующей претензией в случае проигрыша;
                        </li>
                        <li>Вашего персонажа пытают долгие часы, и он при этом, безо всяких на то причин, не испытывает
                            боли
                            и не меняет своё поведение;
                        </li>
                        <li>Ваш персонаж — чародей, одной рукой открывает портал на другой конец Азерота, другой
                            заваривает
                            магический чай, дарующий неуязвимость, и при этом не тратя и десятой доли маны.
                        </li>
                        <p className="color-1">Подобный отыгрыш может быть признан неролевым поведением.</p>
                    </ul>
                    <hr/>

                    <p><span className="color-1">4.11) </span>Если Вы всё же смогли доказать мотивированность
                        данного действия и подмена была одобрена, важно помнить:</p>

                    <div className="ml-3">
                        <p><span className="color-1">4.11.1) </span>Если Вы всё же смогли доказать
                            мотивированность данного действия и подмена была одобрена, важно помнить:</p>
                    </div>

                    <i>Подбор/создание совершенно идентичного двойника является невозможным, так как в реалиях нашего
                        сервера подобное считается павергеймом. Игрок, который совершает подобную подмену своего
                        персонажа
                        обязан дать шанс оппоненту на разоблачение в виде очевидной подсказки</i>

                    <hr/>

                    <p className="color-1">ПРИМЕР:</p>

                    <p>Глаза Вашего основного персонажа были карие, а у двойника - зелёные, разный тембр голоса,
                        заметные
                        шрамы/татуировки/родинки. Ваш персонаж заядлый курильщик, а двойник кашляет от запаха
                        табака.</p>


                    <p><span className="color-1">4.12) </span>Запрещён неодобренный карман - "невидимая армия"
                        дополнительных NPC и т.п. Независимо от того, где и как происходит отыгрыш и насколько логичным
                        выглядит. </p>

                    <div className="ml-3">
                        <p><span className="color-1">4.12.1) </span>Исключение из правила - территория
                            одобренных
                            гильдхаузов, одобренные сюжеты и песочницы, с обоснованием наличия и одобрением такого
                            кармана
                            (к примеру, нпс-паладины в Длани Тира, адепты Культа Проклятых в Каэр Дарроу, стража
                            Андорала и
                            т.п.)</p>
                        <p><span className="color-1">4.12.2) </span>Представитель администрации или ведущий
                            при
                            необходимости может отыграть за нпс игрового мира в общих рп-центрах, если это не
                            противоречит
                            правилам этого рп-центра. В гилдхоллах это могут делать только офицеры гильдии.</p>
                        <hr/>

                        <p className="color-1">ПРИМЕР:</p>

                        <p>В закоулке происходит кража, появляется стражник и сообщает, что за углом еще три стража, и
                            начинает кричать звать подмогу. Такой карман запрещен, и автоматически считается, что крик
                            никто
                            не услышал, к примеру, из-за того, что неподалеку шумно выступали барды и т.п. </p>
                        <hr/>
                    </div>
                </InfoBlock>
            </div>
        </>
    )
}

export default RulePage