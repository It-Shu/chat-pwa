import React, {KeyboardEvent, useEffect, useRef, useState} from 'react';
import {v1} from "uuid";
import {ChatPage} from '../ChatPages/ChatPage';
import {ConnectPage} from "../ChatPages/ConnectPage";


const Chat = () => {

    // local data
    const [myMessages, setMyMessages] = useState<Array<any>>([]);
    const [userId, setUserId] = useState<string>('')
    const [value, setValue] = useState<string>('');
    const socket = useRef<WebSocket>()
    const [connected, setConnected] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('')
    const [avatar, setAvatar] = useState<string>('')

    useEffect(()=> {
        if ('serviceWorker' in navigator){
            navigator.serviceWorker.register('./sw.js').
                then((res)=>{
                console.log('SW res', res)
            }).
                catch((e)=>{
                console.error(e)
            })
        } else {
            console.error('SW ERROR')
        }
    },[])

    // function connect with socket, create a chat name and receive messages from the socket server
    function connect() {
        socket.current = new WebSocket('wss://ws.qexsystems.ru')
        socket.current.onopen = () => {
            setConnected(true)
            const message = {
                event: 'connection',
                username,
                userId: v1(),
            }

            socket.current?.send(JSON.stringify(message))
            setUserId(message.userId)
        }

        socket.current.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data)
            setMyMessages(prev => [...prev, message])
        }
        socket.current.onclose = () => {
            alert('Socket закрыт')
        }
        socket.current.onerror = () => {
            alert('Socket произошла ошибка')
        }
    }

    // function crate message data && send message on socket
    const sendMessage = async () => {
        const currentHour = new Date().getHours().toString()
        const currentMinutes = new Date().getMinutes()

        const minutesWithO = () => {
            return currentMinutes < 10 ? '0' + currentMinutes.toString() : currentMinutes.toString()
        }

        const currentTime = currentHour + ":" + minutesWithO()

        const message = {
            username,
            avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwSgYDB6AplaYZG3mdUygpPwCZCFlXQ8BbIw&usqp=CAU',
            message: value,
            id: v1(),
            userId: userId,
            event: 'message',
            time: currentTime
        }
        socket.current?.send(JSON.stringify(message));
        setMyMessages(prev => [...prev, message])
        setValue('')
        setAvatar(message.avatar)

    }

    // Send message if press Enter on keyboard
    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (connected && e.key === "Enter") {
            return sendMessage()
        } else if (!connected && e.key === "Enter") {
            return connect()
        }
    }


    return (!connected)
        ? <ConnectPage
            connect={connect}
            username={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={onKeyPress}
        />

        : <ChatPage
            value={value}
            userId={userId}
            username={username}
            myMessages={myMessages}
            onChange={e => setValue(e.target.value)}
            sendMessage={sendMessage}
            onKeyDown={onKeyPress}
            avatar={avatar}
        />


};

export default Chat;
