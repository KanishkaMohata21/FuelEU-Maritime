import { Route } from "../../../domain/entities/Route";

export interface RouteRepositoryPort {
    findAll(): Promise<Route[]>;
    findById(id: string): Promise<Route | null>;
    setBaseline(id: string): Promise<void>;
    findBaseline(): Promise<Route | null>;
}
