import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repository = getCustomRepository(TransactionsRepository);

  const transactions = await repository.find();

  const balance = await repository.getBalance();

  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id });
  return response.status(204).send({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute({
      filePath: file.path,
    });
    return response.status(201).json(transactions);
  },
);

export default transactionsRouter;
