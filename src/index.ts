import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import {User} from "./entity/User";
import { Category } from "./entity/Category";
import { Time } from "./entity/Time";

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
    
    // Get All Users
    app.get('/users/', async function(req:Request, res:Response) {
        userRepository.find()
    })

    // Searching User By ID
    app.get('/user/:id', async function(req:Request, res:Response) {
        const results = await userRepository.findOne(req.params.id);
        if (!results) {
            return res.status(404).send("User Not Found");
        }
            return res.send(results);
    });

    // Creating User
    app.post("/user/", async function(req: Request, res: Response) {
        const user = userRepository.create(req.body);
        const results = await userRepository.save(user);
        return res.send(results);
    });

    // Updating User
    app.put("/user/:id", async function(req:Request, res:Response) {
        const user = await userRepository.findOne(req.params.id);
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        userRepository.merge(user,req.body);
        const results = await userRepository.save(user);
        return res.send(results);
    })

    // Deleting User
    app.delete("/user/:id", async function(req:Request, res:Response) {
        const results = await userRepository.delete(req.params.id);
        if (results["affected"] === 0) {
            return res.status(404).send("User Not Found");
        }
        return res.send(results);
    })

    // Get All Categories Of A User
    app.get("/categories/:id", async function(req:Request, res:Response) {
        const id = req.params.id
        const results = await getRepository(Category).createQueryBuilder("category").leftJoinAndSelect("category.times","time").leftJoinAndSelect("category.user","user").where("category.user.userId = :id", { id }).getMany();
        return res.send(results);
    })

    // Search For A Specific Category With ID
    app.get("/categories/:id", async function(req:Request,res:Response) {
        const results = await categoryRepository.findOne(req.params.id);
        if (!results) {
            return res.status(404).send("Category Not Found");
        }
            return res.send(results);
    })

    // Create Category
    app.post("/category/:id", async function(req:Request, res:Response) {
        
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
    app.put("/category/:id", async function(req:Request,res:Response) {
        const category = await categoryRepository.findOne(req.params.id);
        if (!category) {
            return res.status(404).send("Category Not Found");
        }
        categoryRepository.merge(category,req.body);
        const results = await categoryRepository.save(category);
        return res.send(results);
    })

    // Delete Category
    app.delete("/category/:id", async function(req:Request,res:Response) {
        const results = await categoryRepository.delete(req.params.id);
        if (results["affected"] === 0) {
            return res.status(404).send("Category Not Found");
        }
        return res.send(results);
    })

    // Show All Times Logged Of A User
    app.get("/times/:id", async function (req:Request,res:Response) {
        const id = req.params.id
        const results = await getRepository(Time).createQueryBuilder("time").leftJoinAndSelect("time.category","category").leftJoinAndSelect("time.user","user").where("time.user.userId = :id", { id }).getMany();
        return res.send(results);
    })

    // Get One Time Logged
    app.get("/time/:id", async function (req:Request, res:Response) {
        const results = await timesRepository.findOne(req.params.id);
        if (!results) {
            return res.status(404).send("Time Logged Not Found");
        }
        return res.send(results);
    })

    // Create A Time Log
    app.post("/time/:id", async function (req:Request, res:Response) {
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
    app.put("/time/:id", async function (req:Request, res:Response) {
        const time = await timesRepository.findOne(req.params.id);
        if (!time) {
            return res.status(404).send("Time Log Not Found")
        }
        timesRepository.merge(time,req.body);
        const results = timesRepository.save(time);
        return res.send(results);
    })

    // Delete Time Log
    app.delete("/time/:id", async function (req:Request, res:Response) {
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
