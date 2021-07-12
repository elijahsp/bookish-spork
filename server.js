const mysql = require('mysql');
const util = require('util');
const randomMinute=require('random-minute')
const moment=require('moment')
const schedule = require('node-schedule');
const jwt= require('jsonwebtoken')
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var mqtt = require('mqtt');
const { resolve } = require('path');
var client  = mqtt.connect('mqtt://192.168.32.121')
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'guard_patrol'
});
const query=util.promisify(connection.query).bind(connection)
app.listen(5000, () => {
  console.log("server start port 5000");
});
app.get("/devices",authenticateAdmin, async (req, res) => {
  try {
    let sql = `SELECT * FROM devices`;
    
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      
      res.json(results) 
    })
    
    
  } catch (err) {
      console.error(err.message);
  }
});
app.post("/editdevice",authenticateAdmin, async(req,res)=>{
  try{
    let device=req.body

    let sql = `UPDATE devices
           SET deviceNo = "${device.deviceNo}",tag="${device.tag}", assignedUser= "${device.assignedUser}"
           WHERE iddevices = ${device.iddevices}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message+"11111111111");
      }
      res.json(results)
    })
  }catch (err) {
    console.error(err.message);}
})
app.post("/adddevice",authenticateAdmin, async(req,res)=>{
  try{
    let device=req.body
    let sql = `INSERT INTO devices(deviceNo,tag,assignedUser)
           VALUES(${device.deviceNo},"${device.tag}","${device.assignedUser}")`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    })
  }
  catch(err){
    console.log(error)
  }
})
app.get("/areas",authenticateToken, async (req, res) => {
  try {
    let sql = `SELECT * FROM areas`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    });
    
    
  
  } catch (err) {
      console.error(err.message);
  }
});
app.post("/editarea",authenticateAdmin, async(req,res)=>{
  try{
    let area=req.body

    let sql = `UPDATE areas
           SET area = "${device.area}",tag="${area.tag}"
           WHERE idareas = ${area.idareas}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message+"11111111111");
      }
      res.json(results)
    })
  }catch (err) {
    console.error(err.message);}
})
app.post("/addarea",authenticateAdmin, async(req,res)=>{
  try{
    let area=req.body
    let sql = `INSERT INTO areas(area,tag)
           VALUES("${area.area}","${area.tag}")`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    })
  }
  catch(err){
    console.log(error)
  }
})
app.get("/supervisors",authenticateToken, async (req, res) => {
  try {
    let sql = `SELECT * FROM accounts WHERE enabled>0 AND type!='superadmin'`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    }); 
  } catch (err) {
      console.error(err.message);
  }
});
app.get("/guards",authenticateToken, async (req, res) => {
  try {
    let sql = `SELECT * FROM guards`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    });
    
    
  
  } catch (err) {
      console.error(err.message);
  }
});

app.post("/editsuper",authenticateAdmin, async(req,res)=>{
  try{
    supervisor=req.body
    let logger
    let sql = `UPDATE accounts
           SET name = "${supervisor.name}",ID=${supervisor.ID},type="${supervisor.type}"
           WHERE accountsID = ${supervisor.accountsID}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logger=results
      let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2=`INSERT INTO accountslogs(IDdoer,action,IDaffected,source,timeModified)
                VALUES(${supervisor.creator},"modified",${supervisor.ID},"accounts","${timeModified}")`
      connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
      console.log(results)
        res.json(results)
        });
    
  }
  catch(err){
    console.log(error)
  }
})


app.post("/addsuper",authenticateAdmin, async(req,res)=>{
  try{
    let supervisor=req.body
    let logger
    let sql = `INSERT INTO accounts(ID,name,type,password)
           VALUES(${supervisor.ID},"${supervisor.name}","${supervisor.type}",${supervisor.ID})`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logger=results
      let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2=`INSERT INTO accountslogs(IDdoer,action,IDaffected,source,timeModified)
                VALUES(${supervisor.creator},"created",${logger.insertId},"accounts","${timeModified}")`
      connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
      res.json(results)
    });
  }
  catch(err){
    console.log(error)
  }
})
app.post("/disablesuper", async(req,res)=>{
  try{
    let supervisor=req.body
    let sql = `UPDATE accounts
          set enabled=0
          WHERE name="${supervisor.name}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    });
  }
  catch(err){
    console.log(error)
  }
})

app.post("/deletesuper",authenticateAdmin, async(req,res)=>{
  try{
    let supervisor=req.body
    let logger
    let sql0 = `SELECT * FROM accounts
              WHERE name="${supervisor.name}"`;
    connection.query(sql0, (error, results, fields) => {
      if (error) {
        return console.error(error.message+"11111111111");
      }
      logger=results
      console.log(logger)
      let timeDeleted=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2=`INSERT INTO accountsdeleted(IDdeleter,name,IDdeleted,type,accountsID,timeDeleted)
                  VALUES(${supervisor.creator},"${logger[0].name}",${logger[0].ID},"supervisor",${logger[0].accountsID},"${timeDeleted}")`
        connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message+"2222222222");
        }
        console.log(results)
      })
    })
    let sql = `DELETE FROM accounts
              WHERE name="${supervisor.name}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
    });
  }
  catch(err){
    console.log(error)
  }
})

app.post("/addguard",authenticateAdmin, async(req,res)=>{
  try{
    let guard=req.body
    let logger
    let sql = `INSERT INTO guards(name,ID,agency)
           VALUES("${guard.name}",${guard.ID},"${guard.agency}")`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
      logger=results
      let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2=`INSERT INTO accountslogs(IDdoer,action,IDaffected,source,timeModified)
                VALUES(${guard.creator},"created",${logger.insertId},"guards","${timeModified}")`
      connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
    });
  }
  catch(err){
    console.log(error)
  }
})
app.post("/editguard",authenticateAdmin, async(req,res)=>{
  try{
    let guard=req.body
    let logger
    let sql = `UPDATE guards
           SET name = "${guard.name}",ID=${guard.ID}, agency= "${guard.agency}"
           WHERE guardsID = ${guard.guardsID}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message+"11111111111");
      }
        res.json(results)
        logger=results
        let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
        let sql2=`INSERT INTO accountslogs(IDdoer,action,IDaffected,source,timeModified)
                  VALUES(${guard.creator},"modified",${guard.ID},"guards","${timeModified}")`
        connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message+"22222222222");
        }
        console.log(results)
      })
        });
    
  }
  catch(err){
    console.log(error)
  }
})
app.post("/deleteguard",authenticateAdmin, async(req,res)=>{
  try{
    let guard=req.body
    console.log(guard)
    let logger
    let sql0 = `SELECT * FROM guards
              WHERE name="${guard.name}"`;
    connection.query(sql0, (error, results, fields) => {
      if (error) {
        return console.error(error.message+"11111111111");
      }
      logger=results
      console.log(logger)
      let timeDeleted=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2=`INSERT INTO accountsdeleted(IDdeleter,name,IDdeleted,type,accountsID,timeDeleted)
                  VALUES(${guard.creator},"${logger[0].name}",${logger[0].ID},"Guard: ${logger[0].agency}",${logger[0].guardsID},"${timeDeleted}")`
        connection.query(sql2, (error,results,fields)=>{//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message+"2222222222");
        }
        console.log(results)
      })
    })
    let sql = `DELETE FROM guards
              WHERE name="${guard.name}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      res.json(results)
      
        
    });
  }
  catch(err){
    console.log(error)
  }
})

app.post("/addpatrol",authenticateAdmin, async(req,res)=>{
  try {
    let scans=req.body
    let logger
    console.log(scans.time);
    let alarmtime= new Date()
    console.log(Date())
    alarmtime.setHours(alarmtime.getHours()+parseInt(scans.time))
    console.log(alarmtime.getHours())
    let randMinute=randomMinute({ min: 1, max: 59 });
    console.log(randMinute)
    alarmtime.setMinutes(alarmtime.getMinutes()+randMinute)
    let testtime=moment(alarmtime).format('YYYY-MM-DD HH:mm:ss')
    console.log(testtime)
    //setTimeout(()=>testFunc(),scans.time*1000)
    let sql = `INSERT INTO scans(name,area,time,creator)
           VALUES("${req.body.name}","${req.body.area}","${testtime}","${req.body.creator}")`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logger=results
      let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2= `INSERT INTO patrollogs(IDdoer,action,idscans,timeModified)
                VALUES(${scans.creator},"created",${results.insertId},"${timeModified}")`
      connection.query(sql2, (error, results, fields) => {//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
      res.json(results)
    });
    //res.sendStatus(200)
  } catch (error) {
    console.log(error)
  }
})
app.post("/editpatrol",authenticateAdmin, async(req,res)=>{
  try{
    let logger
    let scans=req.body
    console.log(scans)
    let alarmtime= new Date()
    
    alarmtime.setHours(alarmtime.getHours()+parseInt(scans.time))
    
    let randMinute=randomMinute({ min: 1, max: 59 });
    
    alarmtime.setMinutes(alarmtime.getMinutes()+randMinute)
    let testtime=moment(alarmtime).format('YYYY-MM-DD HH:mm:ss')
    
    let sql = `UPDATE scans
           SET name = "${scans.name}",area="${scans.area}", time= "${testtime}"
           WHERE idscans = ${scans.idscans}
           AND headline="Upcoming Scan"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logger=results
      let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql2= `INSERT INTO patrollogs(IDdoer,action,idscans,timeModified)
                VALUES(${scans.creator},"modified",${scans.idscans},"${timeModified}")`
      connection.query(sql2, (error, results, fields) => {//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
        res.json(results)
        });
    
  }
  catch(err){
    console.log(error)
  }
})
app.post("/deletepatrol",authenticateAdmin, async(req,res)=>{
  try{
    let scans=req.body
    console.log(scans)
    let logger
    let timeModified=moment().format('YYYY-MM-DD HH:mm:ss')
    let sql2= `INSERT INTO patrollogs(IDdoer,action,idscans,timeModified)
                VALUES(${scans.creator},"deleted",${scans.idscans},"${timeModified}")`
      connection.query(sql2, (error, results, fields) => {
        if (error) {
          return console.error(error.message);
        }
        console.log(results)
      })
    let sql0=`SELECT * FROM scans WHERE idscans=${scans.idscans}`
    connection.query(sql0, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logger=results
      let timeDeleted=moment().format('YYYY-MM-DD HH:mm:ss')
      let sql1=`INSERT INTO finished(name,area,time,idfinished,status)
      VALUES("${logger[0].name}","${logger[0].area}","${timeDeleted}",${logger[0].idscans},"deleted")`;
      connection.query(sql1, (error, results, fields) => {//THIS ONE IS TO LOG THE CHANGES TO DATABASE
        if (error) {
          return console.error(error.message);
        }
      console.log(results)
      })
    })
    let sql = `DELETE FROM scans
              WHERE idscans=${scans.idscans}
              AND headline="Upcoming Scan"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      console.log(results)
      
      res.json(results)
    });
    //res.sendStatus(200)
  }
  catch(err){
    console.log(error)
  }
})
app.get("/getscan",authenticateAdmin, async(req,res)=>{
  try {
    let sql = `SELECT * FROM scans`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      results.forEach(function(data){
        let timestart=moment(data.time).format('HH')
        
        let timeend=parseInt(timestart)+1
        data.time=moment(data.time).format('YYYY-MMM-DD ha')//+ " between " +timestart+" and " +timeend+ " o'clock"
        
        //console.log(data.time)
      })
      res.json(results)
    });
    
    
  
  } catch (err) {
      console.error(err.message);
  }
})
app.post("/myscan",authenticateToken, async(req,res)=>{//THIS ONE IS FOR USERS TO GET THEIR OWN SCHEDULES
  try {
    console.log(req.body)
    let currentUser
    let sql = `SELECT * FROM guards WHERE ID=${req.body.ID}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
    //console.log(results)
    currentUser=results
    let sql = `SELECT * FROM scans WHERE name="${currentUser[0].name}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      console.log(results)
      results.forEach(function(data){
        let timestart=moment(data.time).format('HH')
        
        let timeend=parseInt(timestart)+1
        data.time=moment(data.time).format('YYYY-MMM-DD ha')//+ " between " +timestart+" and " +timeend+ " o'clock"
        
        //console.log(data.time)
      })
      res.json(results)
    });})
    
    
  
  } catch (err) {
      console.error(err.message);
  }
})
app.post("/myfinished",authenticateToken, async(req,res)=>{//THIS ONE IS FOR USERS TO GET THEIR PAST SCHEDULES
  try {
    console.log(req.body)
    let currentUser
    let sql = `SELECT * FROM guards WHERE ID=${req.body.ID}`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
    //console.log(results)
    currentUser=results
    let sql = `SELECT * FROM finished
    WHERE status<>"deleted" AND name="${currentUser[0].name}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      console.log(results)
      results.forEach(function(data){
        data.time=moment(data.time).format('YYYY-MMM-DD HH:mm')
        
        //console.log(data.time)
      })
      res.json(results)
    });})
    
    
  
  } catch (err) {
      console.error(err.message);
  }
})
app.get("/finished",authenticateAdmin, async(req,res)=>{
  try {
    let sql = `SELECT * FROM finished
              WHERE status<>"deleted"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      results.forEach(function(data){        
        data.time=moment(data.time).format('YYYY-MMM-DD HH:mm')        
      })
      
      res.json(results)
    });
    
    
  
  } catch (err) {
      console.error(err.message);
  }
})

app.get("/patrollogs",authenticateAdmin, async (req,res)=>{//THIS IS LOGS FOR CREATED/MODIFIED SCHEDULS
  try {
    
    let logcontainer//,logcontainer2,logcontainerfinal
    let sql=`SELECT * FROM patrollogs`
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logcontainer=results
      logcontainer.forEach(function(data){
        data.time=moment(data.time).format('YYYY-MMM-DD HH:mm')
        data.text="-User with ID "+ data.IDdoer + " " + data.action + " patrol schedule with patrol ID "+ data.idscans+ " at "+data.time
      })
      
      
      res.json(logcontainer)
    //})
      
    })
  } 
  catch (error) {
    console.log(error)  
  }
})

app.get("/accountslogs",authenticateAdmin, async (req,res)=>{//THIS ONE IS FOR CREATION/MODIFICIATION LOGS ON ACCOUNTS
  try {
    
    let logcontainer//,logcontainer2,logcontainerfinal
    let sql=`SELECT * FROM accountslogs`
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      logcontainer=results
      logcontainer.forEach(function(data){
        //console.log(data.timeModified)
        data.timeModified=moment(data.timeModified).format('YYYY-MMM-DD HH:mm')
        data.text="-User with ID "+ data.IDdoer + " " + data.action + " account with ID "+ data.IDaffected+ " at "+ data.timeModified
      })
      
      
      res.json(logcontainer)
    //})
      
    })
  } 
  catch (error) {
    console.log(error)  
  }
})






function authenticateToken(req, res, next) {//USER ACCOUNT AUTHENTICATION
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "patrol token", (err, user) => {
      //console.log(err.message);
      if (err)         
      authenticateAdmin(req,res,next)
      
      else{
      req.user = user;
      next();}
  });
}
function authenticateAdmin(req, res, next) {//ADMIN ACCOUNT AUTHENTICATION
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "admin patrol token", (err, user) => {
      //console.log(err.message);
      if (err) return res.sendStatus(403);
      
      
      req.user = user;
      next();
  });
}
function generateAccessToken(user) {//GENERTATE USER TOKEN
  const usertoken = {
      username: user,
      time: Date(),
  };
  console.log(user);
  return jwt.sign(usertoken, "patrol token", { expiresIn: "1h" });
}
function generateAdminToken(user) {//GENERATE ADMIN TOKEN
  const usertoken = {
      username: user,
      time: Date(),
  };
  console.log(user);
  return jwt.sign(usertoken, "admin patrol token", { expiresIn: "1h" });
}



app.post("/login", async (req, res) => {
  //----------------------------------------------------login to application
  try{
    let allUser
  let sql=`SELECT * FROM accounts`
  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    
    allUser=results
    let sql2=`SELECT * FROM guards`
    connection.query(sql2, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    results.forEach((data)=>
    {
      allUser.push(data)
    }
    )
    
    console.log(allUser[15])
    
    var userIndex = allUser.findIndex(function(users, index) {
      if(users.ID == req.body.username&&users.password==req.body.password)
          return true;
      });
      console.log("CHECKPOINT 1")
      console.log(userIndex)
      if(userIndex==-1)
        return res.sendStatus(401)
      if(allUser[userIndex].type=="admin")
        {
            const accessToken = generateAdminToken(req.body.username);
            console.log("admin")
                res.token = accessToken;
                res.append("token", accessToken);
                var respo="admin " + accessToken
                res.status(200).send(respo);
        }
        else if(allUser[userIndex].type=="superadmin")
        {
            const accessToken = generateAdminToken(req.body.username);
            console.log("admin")
                res.token = accessToken;
                res.append("token", accessToken);
                var respo="superadmin " + accessToken
                res.status(200).send(respo);
        }
      else
        {
            const accessToken = generateAccessToken(req.body.username);
            console.log("not admin")
                res.token = accessToken;
                res.append("token", accessToken);
                var respo="notAdmin " + accessToken
                res.status(200).send(respo);
        }})
      /*else
      res.sendStatus(401);*/
  })
  


  
  
}
  catch(error)
  {console.log(error)}

 
  
});
//EVERY HOUR CHECKS THE DATABASE FOR SCHEDULED RUNS THEN ALARMS THE DEVICES
const job = schedule.scheduleJob('25 * * * *', function(){
  try{
    let timetest=new Date()
    let timetest2=new Date()
    timetest2.setHours(timetest2.getHours()+1)
    let timetestmoment=moment(timetest).format('YYYY-MM-DD HH:mm:ss')
    let timetest2moment=moment(timetest2).format('YYYY-MM-DD HH:mm:ss')
    
    let sql =`UPDATE scans
              SET headline="Alarm Soon"
              WHERE time>"${timetestmoment}" AND time<"${timetest2moment}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }})
    sql = `SELECT * FROM scans WHERE time>"${timetestmoment}" AND time<"${timetest2moment}"`;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Scans for the next hour:")
      console.log(results)
      results.forEach(function(data){
      let alarmtimer=moment(data.time).format('mm')*1000*60 //1000 milliseconds * 60 seconds to get 1 minute then multiply to the minute of the actual schedule SET THIS TO PROPER TIME ON ACTUAL DEPLOYMENT
        
      console.log(data.area+":"+data.time)
      setTimeout(()=>{
        try{
          let sql2=`SELECT * FROM areas where area="${data.area}"`
          connection.query(sql2, (error, results, fields) => {
            if (error) {
              return console.error(error.message);
            }
          
          data.tag=results[0].tag//tag here refers to area rfid tag
          console.log(data)
          let sql0=`SELECT * FROM devices WHERE assignedUser="${data.name}"`
          
          connection.query(sql0, (error, results, fields) => {
            if (error) {
              return console.error(error.message);
            }
            if (results){//TAG here refers to device tag
              data.devtag=results[0].tag
              let deviceResponse,deviceTopic
              client.subscribe(results[0].tag)
              let alarmSend=setInterval(()=>{
                client.publish(results[0].tag,`PATROL ${data.area}`)
                deviceResponse=testmqtt.message
                deviceTopic=testmqtt.topic
                console.log(deviceResponse)
                if(deviceResponse=="ALARM RECEIVED"&&deviceTopic==results[0].tag){
                  clearInterval(alarmSend)//to determine if alarm was received and stop sending
                  client.unsubscribe(results[0].tag)
                }
                  
              },1000)//basta interval kung kailan magresend
              setTimeout(function(){//to stop sending notif for alarm
                if(alarmSend)
                clearInterval(alarmSend)
                client.unsubscribe(results[0].tag)
              },30000)//ON DEPLOYMENT CHANGE THIS TO 5 MINUTES
            }
              
          })
          
          alarm(data)
          })
        } catch(error){
          console.log(error)
        }
            
          console.log(data.name+":"+data.area)}, alarmtimer)
        
      
      })
    }); 
  } catch (err) {
      console.error(err.message);
  }
})
function alarm(data){
  let sql=`UPDATE scans
          SET headline="Ongoing"
          where idscans=${data.idscans}`
  connection.query(sql, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }})
  client.subscribe(data.tag)
  let scanner
  let mqttVarChecker=setInterval(() => {
    if(testmqtt.topic==data.tag)
      scanner=testmqtt.message
      //client.publish(data.devtag,"RECEIVED")
    
  }, 100);




  setTimeout(function(){
  let sql0=`SELECT * FROM devices WHERE tag="${scanner}"`
  let scanner2
  connection.query(sql0, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
  scanner2=results
  clearInterval(mqttVarChecker)
  client.unsubscribe(data.tag)
  if(!scanner)
    data.status="not scanned"
  else if (scanner2[0].assignedUser==data.name)
    data.status="complete"
  else if(scanner2[0].assignedUser!=data.name)
    data.status="wrong tag"
  scanner=""
  console.log(data)
  
  let timeVariableTransfer= moment(data.time).format('YYYY-MM-DD HH:mm:ss')
  let sql2 = `INSERT INTO finished(name,area,time,idfinished,status,creator)
    VALUES("${data.name}","${data.area}","${timeVariableTransfer}",${data.idscans},"${data.status}",${data.creator})`;
  connection.query(sql2, (error, results, fields) => {
    if (error) {
    return console.error(error.message);
    }
    let sql3 = `DELETE FROM scans
      WHERE idscans="${data.idscans}"`;
    connection.query(sql3, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
    }); 
  })
})
  },10*60**1000)//CHANGE THIS TO 10 MINUTES ON ACTUAL DEPLOYMENT
return
}

client.on('connect', function () {
  let testas="presence"
  client.subscribe(testas)
})
var testmqtt={}
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(message.toString())
  console.log(topic+":"+message.toString())
  testmqtt.message=message.toString()
  testmqtt.topic=topic
  
})
