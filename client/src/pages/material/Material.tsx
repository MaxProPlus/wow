import React, {Component} from "react"
import './Material.scss'
import {Link} from "react-router-dom";

class Material extends Component<any, any> {


    render() {
        return (
            <div className="page-material">
                <div className="material-top">
                    <div className="block">
                        <Link to="/character">Персонажи</Link>
                    </div>
                </div>
            </div>
        )
    }

}

export default Material