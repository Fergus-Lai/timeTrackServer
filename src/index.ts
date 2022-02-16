import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import {User} from "./entity/User";
import { Category } from "./entity/Category";
import { Time } from "./entity/Time";
import { randomBytes, pbkdf2Sync, createHash} from "crypto";

require('dotenv').config();

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    let userRepository = connection.getRepository(User)
    let categoryRepository = connection.getRepository(Category)
    let timesRepository = connection.getRepository(Time)

    function apiCheck(key:string) {
        key = createHash("md5").update(key).digest('hex');
        return key === process.env.key
    }

    
    // Get All Users
    app.get('/users/:api/', async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const results = await userRepository.find();
        return res.send(results);
    })

    // Searching User By ID
    app.get('/user/:api/:id', async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        }
        const results = await userRepository.findOne(req.params.id);
            if (!results) {
                return res.status(404).send("User Not Found");
            }
                return res.send(results);
    });

    // Creating User
    app.post("/user/:api/", async function(req: Request, res: Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        var salt = randomBytes(16).toString('hex');

        req.body = {
            ...req.body,
            "salt":salt,
        }
        // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest
        req.body["password"] = pbkdf2Sync(req.body["password"], salt, 1000, 64, `sha512`).toString(`hex`);
        const user = userRepository.create(req.body);
        const results = await userRepository.save(user);
        return res.send(results);
    });

    // Log In
    app.post("/login/:api/", async function(req:Request, res:Response) {
        if (!(apiCheck(req.params.api))) {
            return res.sendStatus(403);
        };
        const user = await userRepository.findOne({"email":req.body["email"]});
        if (!user) {
            res.status(404).send("User Not Found")
        };

        if (user.validPassword(req.body["password"])) {
            return res.status(201).send(
                "User Logged In",
            )
        }
        return res.status(400).send("Wrong Password");
    })


    // Updating User
    app.put("/user/:api/:id/", async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const user = await userRepository.findOne(req.params.id);
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        userRepository.merge(user,req.body);
        const results = await userRepository.save(user);
        return res.send(results);
    })

    // Deleting User
    app.delete("/user/:api/:id/", async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const results = await userRepository.delete(req.params.id);
        if (results["affected"] === 0) {
            return res.status(404).send("User Not Found");
        }
        return res.send(results);
    })

    // Get All Categories Of A User
    app.get("/categories/:api/:id/", async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const id = req.params.id
        const results = await getRepository(Category).createQueryBuilder("category").leftJoinAndSelect("category.times","time").leftJoinAndSelect("category.user","user").where("category.user.userId = :id", { id }).getMany();
        return res.send(results);
    })

    // Search For A Specific Category With ID
    app.get("/categories/:api/:id", async function(req:Request,res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const results = await categoryRepository.findOne(req.params.id);
        if (!results) {
            return res.status(404).send("Category Not Found");
        }
            return res.send(results);
    })

    // Create Category
    app.post("/category/:api/:id", async function(req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        
        const user = await userRepository.findOne(req.params.id);

        if (!user) {
            return res.status(404).send("User Not Found");
        }

        req.body = {
            ...req.body,
            "user":user
        }

        const category = categoryRepository.create(req.body);
        
        const results = await categoryRepository.save(category);

        return res.send(results);
    })
    
    // Update Category
    app.put("/category/:api/:id", async function(req:Request,res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };

        const category = await categoryRepository.findOne(req.params.id);
        if (!category) {
            return res.status(404).send("Category Not Found");
        }
        categoryRepository.merge(category,req.body);
        const results = await categoryRepository.save(category);
        return res.send(results);
    })

    // Delete Category
    app.delete("/category/:api/:id", async function(req:Request,res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };

        const results = await categoryRepository.delete(req.params.id);
        if (results["affected"] === 0) {
            return res.status(404).send("Category Not Found");
        }
        return res.send(results);
    })

    // Show All Times Logged Of A User
    app.get("/times/:api/:id", async function (req:Request,res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const id = req.params.id
        const results = await getRepository(Time).createQueryBuilder("time").leftJoinAndSelect("time.category","category").leftJoinAndSelect("time.user","user").where("time.user.userId = :id", { id }).getMany();
        return res.send(results);
    })

    // Get One Time Logged
    app.get("/time/:api/:id", async function (req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const results = await timesRepository.findOne(req.params.id);
        if (!results) {
            return res.status(404).send("Time Logged Not Found");
        }
        return res.send(results);
    })

    // Create A Time Log
    app.post("/time/:api/:id", async function (req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const user = await userRepository.findOne(req.params.id);
        if (!user) {
            return res.status(404).send("User Not Found");
        }

        req.body = {
            ...req.body,
            "user":user,
        };

        req.body["startTime"] = new Date(req.body["startTime"]);
        const time = timesRepository.create(req.body);
        const result = await timesRepository.save(time);

        return res.send(result);
    })

    // Update Time Log
    app.put("/time/:api/:id", async function (req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const time = await timesRepository.findOne(req.params.id);
        if (!time) {
            return res.status(404).send("Time Log Not Found")
        }
        timesRepository.merge(time,req.body);
        const results = timesRepository.save(time);
        return res.send(results);
    })

    // Delete Time Log
    app.delete("/time/:api/:id", async function (req:Request, res:Response) {
        if (!apiCheck(req.params.api)) {
            return res.sendStatus(403);
        };
        const results = await timesRepository.delete(req.params.id);
        if (results["affected"] === 0) {
            return res.status(404).send("Time Log Not Found");
        }
        return res.send(results);
    })

    // start express server
    app.listen(3000);

    console.log("Express server has started on port 3000. Open http://localhost:3000/");

}).catch(error => console.log(error));
