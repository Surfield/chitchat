import React, {Component} from 'react';
import ChannelSection from './channels/ChannelSection.jsx'
import UserSection from './users/UserSection.jsx'
import MessageSection from './messages/MessageSection.jsx';
import Socket from '../socket.js';

class App extends Component{
	constructor(props){
		super(props);
		this.state = {
			channels: [],
			activeChannel: {},
			users: [],
			messages: []
		};
	}

	componentDidMount(){
		let socket = this.socket = new Socket();
		socket.on('connect', this.onConnect.bind(this));
		socket.on('disconnect', this.onDisconnect.bind(this));
		socket.on('channel_add', this.onAddChannel.bind(this));
		socket.on('user_add', this.onAddUser.bind(this));
		socket.on('user_edit', this.onEditUser.bind(this));
		socket.on('user_remove', this.onRemoveUser.bind(this));
		socket.on('message_add', this.onAddMessage.bind(this));
	}

	onAddMessage(message){
		let {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	}

	onRemoveUser(removeUser){
		let {users} = this.state;
		users = users.filter(user =>{
			return user.id !== removeUser.id
		});
		this.setState({users});
	}

	onAddUser(user){
		let {users} = this.state;
		users.push(user);
		this.setState({users});
	}

	onEditUser(editUser){
		let {users} = this.state;
		users = users.map(user => {
			if(editUser.id === user.id){
				return editUser;
			}
			return user;
		});
		this.setState({users});
	}

	onConnect(){
		this.setState({connected: true});
		this.socket.emit('channel_subscribe');
		this.socket.emit('user_subscribe');
	}

	onDisconnect(){
		this.setState({connected: false});
	}

	onAddChannel(channel){
		let {channels} = this.state;
		channels.push(channel);
		this.setState({channels});
	}

	addChannel(name){
		this.socket.emit('channel_add', {name});
	}

	setChannel(activeChannel){
		this.setState({activeChannel});
		this.socket.emit('message_unsubscribe');
		this.setState({messages: []});
		this.socket.emit('message_subscribe', {channelId: activeChannel.id});
	}

	setUserName(name){
		this.socket.emit('user_edit', {name});
	}

	addMessage(body){
		let {activeChannel} = this.state;
		this.socket.emit('message_add', {channelId: activeChannel.id, body});
	}

	render(){
		return(
			<div className='app'>
				<div className='nav'>
					<ChannelSection 
						{...this.state}
						addChannel={this.addChannel.bind(this)} 
						setChannel={this.setChannel.bind(this)}/>
					<UserSection
						{...this.state}
						setUserName={this.setUserName.bind(this)} />
				</div>
				<MessageSection 
					{...this.state}
					addMessage={this.addMessage.bind(this)} />
			</div>
		)
	}
}

export default App