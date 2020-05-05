import React from 'react';
import $ from 'jquery';
import Messages from './message-list';
import Input from './input';
import Login from './Login';
import _map from 'lodash/map';
import io from 'socket.io-client';

import './App.scss';
import './Login.scss';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        //Khởi tạo state,
        this.state = {
            messages: [],               // danh sách tin nhắn
            userTyping: [],             // danh sách người đang nhập bàn phím
            user: {id: '', name: ''},   // người dùng hiện tại, nếu rỗng sẽ hiển thị form login, có sẽ hiển thị phòng chat
            userOnline:[]               // danh sách người dùng đang online
        }
        this.socket = null;
    }


    //Connect với server nodejs, thông qua socket.io
    componentWillMount() {
        console.log(this.state.user)
        this.socket = io('localhost:6969');
        this.socket.on('newMessage', (response) => {this.newMessage(response)}); //lắng nghe khi có tin nhắn mới
        this.socket.on('updateUserTypingList', (response) => {this.setState({userTyping: response})}); //lắng nghe khi có người nhập tin nhắn
        this.socket.on('loginFail', (response) => {alert('Tên đã có người sử dụng')}); //login fail
        this.socket.on('loginSuccess', (response) => {this.setState({user: {id: this.socket.id, name: response}})}); //đăng nhập thành công 
        this.socket.on('updateUserList', (response) => {this.setState({userOnline: response})}); //update lại danh sách người dùng online khi có người đăng nhập hoặc đăng xuất
    }


    //Khi có tin nhắn mới, sẽ push tin nhắn vào state mesgages, và nó sẽ được render ra màn hình
    newMessage(m) {

        const messages = this.state.messages;

        let ids = _map(messages, 'id');
        let max = Math.max(...ids);

        messages.push({
            id: max+1,
            userId: m.user.id,
            message: m.data,
            userName: m.user.name
        });

        let objMessage = $('.messages');

        if (objMessage[0].scrollHeight - objMessage[0].scrollTop === objMessage[0].clientHeight ) {
            this.setState({messages});
            objMessage.animate({ scrollTop: objMessage.prop('scrollHeight') }, 300); //tạo hiệu ứng cuộn khi có tin nhắn mới
        } else {
            this.setState({messages});
            if (m.id === this.state.user) {
                objMessage.animate({ scrollTop: objMessage.prop('scrollHeight') }, 300);
            }
        }
        
    }

    //Gửi event socket newMessage với dữ liệu là nội dung tin nhắn và người gửi
    sendNewMessage(m) {
        if (m.value) {
            this.socket.emit("newMessage", {data:m.value, user: this.state.user}); //gửi event về server
            m.value = ""; 
        }
    }

    //login để định danh người dùng
    login(name) {
        this.socket.emit("login", name); 
    }

    // Hiển thi ai đang nhập tin nhắn
    sendTyping(m) {
        if (m.value) {
            this.socket.emit("typing", {data:m.value, user: this.state.user});
        }
    }

    render () {
        return (
           <div>
            {/* kiểm tra xem user đã tồn tại hay chưa, nếu tồn tại thì render form chat, chưa thì render form login */}
              { this.state.user.id && this.state.user.name ? 
                <div className="app__content">
                    <div className="chat_window">
                        {/* danh sách user online */}
                        <div className="menu">
                            <ul className="user">
                            <span className="user-name">{this.state.user.name}</span>
                                {this.state.userOnline.map(item =>
                                    {return this.state.user.name !== item.name ? 
                                        <li key={item.id}><span className="dot"></span><span className="user-name-list">{item.name}</span></li>
                                        : ''
                                    }
                                )}
                            </ul>
                        </div>
                        
                        {/* danh sách message */}
                        <div className="content">
                            <Messages user={this.state.user} messages={this.state.messages} typing={this.state.userTyping}/>
                            {this.state.userTyping.map(item =>
                                <span> {item.name}</span>
                            )} 
                            { this.state.userTyping.length>0 ? <span> typing...</span> : '' }
                            <Input sendMessage={this.sendNewMessage.bind(this)} sendTyping={this.sendTyping.bind(this)}/>
                        </div>
                    </div> 
                </div>
                :
                <Login loginApp={this.login.bind(this)} />
              }
            </div>
        )
    }
}
