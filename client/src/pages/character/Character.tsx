import React from "react"
import Spinner from "../../components/spinner/Spinner"
import {
    activeToString,
    Character,
    characterStatusToString,
    sexToString
} from "../../../../server/src/common/entity/types";
import UserContext from "../../utils/userContext";
import CharacterApi from "../../api/CharacterApi";
import AlertDanger from "../../components/alert-danger/AlertDanger";
import './Character.scss'

type IState = {
    isLoaded: boolean
    errorMessage: string
    id: string
    character: Character
}

class CharacterPage extends React.Component<any, IState> {
    static contextType = UserContext
    private characterApi = new CharacterApi()

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            errorMessage: '',
            id: props.match.params.id,
            character: new Character(),
        }
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        this.characterApi.getById(this.state.id).then(r => {
            this.setState({
                character: r[0]
            })
        }, err => {
            this.setState({
                errorMessage: err
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}
                <div className="page-character">
                    <AlertDanger>{this.state.errorMessage}</AlertDanger>
                    <div className="title">{this.state.character.title}</div>
                    <div className="nickname">{this.state.character.nickname}</div>
                    <div className="info">
                        <div className="info-left">
                            <div className="info-left-inner">
                                <img src={this.state.character.urlAvatar} alt=""/>
                            </div>
                        </div>
                        <div className="info-right">
                            <div className="info-right-block">
                                <span className="info-desc">Раса</span>
                                <span className="info-value">{this.state.character.race}</span>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Пол</div>
                                <div className="info-value">{sexToString(this.state.character.sex)}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Возраст</div>
                                <div className="info-value">{this.state.character.age}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Нация</div>
                                <div className="info-value">{this.state.character.nation}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Места</div>
                                <div className="info-value">{this.state.character.territory}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Класс</div>
                                <div className="info-value">{this.state.character.className}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Род занятий</div>
                                <div className="info-value">{this.state.character.occupation}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Верования</div>
                                <div className="info-value">{this.state.character.religion}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Знания языков</div>
                                <div className="info-value">{this.state.character.languages}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Статус</div>
                                <div className="info-value">{characterStatusToString(this.state.character.status)}</div>
                            </div>
                            <div className="info-right-block">
                                <div className="info-desc">Активность</div>
                                <div className="info-value">{activeToString(this.state.character.active)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="description">
                        {this.state.character.description}
                    </div>

                </div>
            </div>
        )
    }
}

export default CharacterPage