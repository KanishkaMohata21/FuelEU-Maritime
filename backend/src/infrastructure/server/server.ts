import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository';
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository';
import { PrismaBankingRepository } from '../../adapters/outbound/postgres/PrismaBankingRepository';
import { GetRoutesUseCase } from '../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../core/application/use-cases/SetBaselineUseCase';
import { GetRouteComparisonUseCase } from '../../core/application/use-cases/GetRouteComparisonUseCase';
import { GetComplianceSnapshotUseCase } from '../../core/application/use-cases/GetComplianceSnapshotUseCase';
import { GetAdjustedComplianceUseCase } from '../../core/application/use-cases/GetAdjustedComplianceUseCase';
import { GetBankingRecordsUseCase } from '../../core/application/use-cases/GetBankingRecordsUseCase';
import { BankSurplusUseCase } from '../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankingUseCase } from '../../core/application/use-cases/ApplyBankingUseCase';
import { RoutesController } from '../../adapters/inbound/http/RoutesController';
import { ComplianceController } from '../../adapters/inbound/http/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/BankingController';
import { PrismaPoolRepository } from '../../adapters/outbound/postgres/PrismaPoolRepository';
import { CreatePoolUseCase } from '../../core/application/use-cases/CreatePoolUseCase';
import { PoolController } from '../../adapters/inbound/http/PoolController';

const app = express();

// Configure CORS first
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options(/(.*)/, cors()); // Enable pre-flight requests for all routes using regex

app.use(express.json());

// Singleton Prisma Client
const prisma = new PrismaClient();

// Dependency Injection
const routeRepository = new PrismaRouteRepository(); // Takes no args currently, uses own instance
const complianceRepository = new PrismaComplianceRepository(prisma);
const bankingRepository = new PrismaBankingRepository(prisma);
const poolRepository = new PrismaPoolRepository(prisma);

const getRoutesUseCase = new GetRoutesUseCase(routeRepository);
const setBaselineUseCase = new SetBaselineUseCase(routeRepository);
const getRouteComparisonUseCase = new GetRouteComparisonUseCase(routeRepository);
const getComplianceSnapshotUseCase = new GetComplianceSnapshotUseCase(complianceRepository, routeRepository);
const getAdjustedComplianceUseCase = new GetAdjustedComplianceUseCase(getComplianceSnapshotUseCase, bankingRepository);
const getBankingRecordsUseCase = new GetBankingRecordsUseCase(bankingRepository);
const bankSurplusUseCase = new BankSurplusUseCase(getComplianceSnapshotUseCase, bankingRepository);
const applyBankingUseCase = new ApplyBankingUseCase(bankingRepository);
const createPoolUseCase = new CreatePoolUseCase(poolRepository, getAdjustedComplianceUseCase);

const routesController = new RoutesController(
    getRoutesUseCase,
    setBaselineUseCase,
    getRouteComparisonUseCase
);

const complianceController = new ComplianceController(
    getComplianceSnapshotUseCase,
    getAdjustedComplianceUseCase
);

const bankingController = new BankingController(
    getBankingRecordsUseCase,
    bankSurplusUseCase,
    applyBankingUseCase
);

const poolController = new PoolController(createPoolUseCase);

// Routes
app.get('/routes', (req, res) => routesController.getAll(req, res));
app.post('/routes/:id/baseline', (req, res) => routesController.setBaseline(req, res));
app.get('/routes/comparison', (req, res) => routesController.getComparison(req, res));

// Compliance Routes
app.get('/compliance/cb', (req, res) => complianceController.getComplianceBalance(req, res));
app.get('/compliance/adjusted-cb', (req, res) => complianceController.getAdjustedCompliance(req, res));

// Banking Routes
app.get('/banking/records', (req, res) => bankingController.getBankingRecords(req, res));
app.post('/banking/bank', (req, res) => bankingController.bankSurplus(req, res));
app.post('/banking/apply', (req, res) => bankingController.applyBanking(req, res));

// Pool Routes
app.post('/pools', (req, res) => poolController.createPool(req, res));

export { app };
