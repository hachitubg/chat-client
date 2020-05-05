import React from 'react';

export default class OnlineList extends React.Component {
    render () {
        return (
            <ul className="messages">
                {this.props.messages.map(item =>
                    <li><span>{item}</span></li>
                )}
            </ul>
        )
    }
}