const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const port = 8080

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))

var CurrentID = null

const readFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, "utf8", (err, data) => {
            if (err) {
                console.error(err)
                return;
            }

            const tasks = JSON.parse(data)
            resolve(tasks)
        })
    })
}

app.get('/', (req, res) => {
    readFile("./tasks.json")
        .then(tasks => {
            res.render('index', { tasks: tasks, error: null })
        })
})

app.post("/", (req, res) => {
    let error = null
    if (req.body.task === "") {
        error = "Please insert correct task data"
        readFile("./tasks.json")
            .then(tasks => {
                res.render('index', { tasks: tasks, error: error })
            })
    } else {
        readFile("./tasks.json")
            .then(tasks => {
                const newTask = {
                    "id": crypto.randomUUID(),
                    "task": req.body.task
                }

                tasks.push(newTask)
                const data = JSON.stringify(tasks, null, 2)
                fs.writeFile('./tasks.json', data, err => {
                    if (err) {
                        console.log(err)
                        return;
                    } else {
                        console.log("saved")
                    }

                    res.redirect('/')
                })
            })
    }
})

app.get("/delete-task/:taskId", (req, res) => {
    let deletedTaskId = req.params.taskId
    readFile('./tasks.json')
        .then(tasks => {
            tasks.forEach((task, index) => {
                if (task.id === deletedTaskId) {
                    tasks.splice(index, 1)
                }
            });
            data = JSON.stringify(tasks, null, 2)
            fs.writeFile('./tasks.json', data, "utf-8", err => {
                if (err) {
                    console.log(err)
                    return;
                }

                res.redirect("/")
            })
        })
})

function updateTask(jsonData, itemId, newTask) {
    let data = JSON.parse(jsonData);

    for (let item of data) {
        if (item.id === itemId) {
            item.task = newTask;
            break;
        }
    }

    return JSON.stringify(data, null, 2);
}

app.get("/edit/:taskId", (req, res) => {
    res.render('edit', { error: null })
    CurrentID = req.params.taskId
})

app.get("/delete-all", (req, res) => {
    const data = []
    fs.writeFile("./tasks.json", JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Deleted all!");
        res.redirect("/")
    });
})

app.post("/edit", (req, res) => {
    const EditVal = req.body.task
    var error = "Field cannot be empty"
    if (EditVal === "") {
        res.render('edit', { error: error })
    } else {
    readFile('./tasks.json')
        .then(tasks => {
            const updatedJson = updateTask(JSON.stringify(tasks), CurrentID, EditVal);

            // Write the updated JSON back to the file
            fs.writeFile("./tasks.json", updatedJson, 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Saved!");
                res.redirect("/")
            });
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})