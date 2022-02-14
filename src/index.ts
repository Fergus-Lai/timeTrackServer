import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";
import {User} from "./entity/User";
import { Category } from "./entity/Category";

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
        const results = await userRepository.findOne(req.params.id, {relations: ["categories"]});
        if (!results) {
            return res.status(404).send("User Not Found");
        }
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

    // start express server
    app.listen(3000);

    console.log("Express server has started on port 3000. Open http://localhost:3000/");

}).catch(error => console.log(error));
