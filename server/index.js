const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');
const fs = require('fs');
const PORT=process.env.PORT||4040

dotenv.config();
mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) throw err;
});
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
//app.use(cors());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ['http://localhost:4173'];
app.use(cors({
  origin: function (origin, callback) {
    // Check if the requesting origin is in the allowedOrigins array or if it's undefined (for same-origin requests)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies) to be sent with the request
}));
/*app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
})); */

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });
   
}
app.get('/',(a,b)=>{
   b.send('hi');
})
app.get('/test', (req,res) => {
  res.json('test ok');
});
//here we are retrieving the messages from db and sending back to the user 
/*app.get('/messages/:userId', async (req,res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt: 1});
  res.json(messages);
  console.log("messages sent successsfully");
}); */
app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const { page,pageSize} = req.query;
  console.log("pagecount"+page);

  // Calculate skip value based on the page and pageSize
  const skip = (page - 1) * pageSize;

  try {
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize));

    res.json(messages);
    console.log("Messages sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// get the unread messages from the database
app.get('/unread',async(req,res)=>{
  try {
    // Find all unread messages in the database
    const unreadMessages = await Message.find({read: false });
    // Send the unread messages as a JSON response to the front end
    res.json({ messages: unreadMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/people', async (req,res) => {
  const users = await User.find({}, {'_id':1,username:1});
  res.json(users);
});

app.get('/profile', (req,res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);    
    });
  } else {
    res.status(401).json('no token');
  }
});

app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
        res.cookie('token', token, {sameSite:'none', secure:true}).json({
          id: foundUser._id,
        });
      });
    }
  }
});


app.post('/logout', (req,res) => {
  res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
});


app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try {

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username:username,
      password:hashedPassword,
    });

    jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });
  } catch(err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});



const server = app.listen(PORT,()=>{
  console.log("server running on port" +PORT)
});
const activeConnections = new Set();
const wss = new ws.WebSocketServer({server});


wss.on('connection', (connection, req) => {
  activeConnections.add(connection);
   console.log("size of connections"+ activeConnections.size);

 
   connection.on('close', () => {
    activeConnections.delete(connection);
  //  console.log('Client disconnected');
    console.log('Client disconnected:', connection.username, connection.userId);
    // Perform cleanup or other actions here
  });

      
 // console.log(wss.clients.size);
 // console.log(wss.clients);
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });
  // read username and id form the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }
    

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
      if(messageData.event==='openChat')
        {
            openChat(messageData.recipient);
        }
       if(messageData.event==='startTyping')
       {
             console.log("start typing");
             console.log(messageData.event);
             const value=true;
             const recipient= messageData.recipient;
             typing({recipient,value});
       }
       if(messageData.event==='stopTyping')
       {     
            console.log("stop typing");
            console.log(messageData.event);
             const value=false;
             const recipient= messageData.recipient;
             typing({recipient,value});
       }
    const {recipient, text, file} = messageData;
    let filename = null;
    if (file) {
      console.log('size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.'+ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = new Buffer(file.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:'+path);
      });
    }

    //as of now we are using this functionality 
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender:connection.userId,
        recipient,
        text,
        file: file ? filename : null,
        read: false,   
      });
      console.log('created message');
      //console.log("showing connected clints to the server ");
      //console.log(wss.clients);

      // when i'm abel to send the message directly to an open connection which means
      // that user has already opned your chat section and chatting to you 
      // so you can send them 

      [...activeConnections]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          text,
          sender:connection.userId,
          recipient,
          file: file ? filename : null,
          _id:messageDoc._id,
          createdAt: new Date().toISOString(),
          read: true
        })));
    }
  });
  // let's create another websocket event that makes the unread messages true 
 async function openChat(recipient) {
    console.log("inside openchat");
    await Message.updateMany(
      { sender: recipient, recipient: connection.userId, read: false },
      { $set: { read: true } }
    );

    // Notify the sender that their messages have been read
    const senderConnection = [...wss.clients].find(
      (c) => c.userId === recipient
    );
    // sending a message to user B 
    // at the client side just go to the eventlistener do someting with that message 
    if (senderConnection) {
      senderConnection.send(JSON.stringify({ messagesRead: true ,sender:connection.userId}));      
    }
  };
  function typing({recipient,value})
  {
    const senderConnection= [... activeConnections].find((c)=> c.userId===recipient);
    if(senderConnection)
     { console.log("sending typing message ")
     senderConnection.send(JSON.stringify({typing:value,sender:connection.userId}));
     }
  }

  
  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});
