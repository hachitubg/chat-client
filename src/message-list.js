import React from 'react';
import Message from './message-item';


export default class MessageItem extends React.Component {
    render () {
        return (
            <ul className="messages">
                {this.props.messages.map(item =>
                    <Message key={item.id} user={item.userName === this.props.user.name? true: false} message={item}/>
                )}
            </ul>
        )
    }
}