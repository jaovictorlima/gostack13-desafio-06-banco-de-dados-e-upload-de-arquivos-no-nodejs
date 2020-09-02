import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

export type TypesTransaction = 'income' | 'outcome';

interface RequestDTO {
  title: string;
  value: number;
  type: TypesTransaction;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(`You don't have enough balance`, 400);
    }

    let findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = await categoryRepository.save({ title: category });
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: findCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
