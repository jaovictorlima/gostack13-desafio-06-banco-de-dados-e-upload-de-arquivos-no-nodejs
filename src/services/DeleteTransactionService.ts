// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    const repository = getRepository(Transaction);
    const transaction = await repository.findOne(id);
    if (!transaction) {
      throw new AppError(`The transaction with the ${id} does not exist.`, 400);
    }
    await repository.delete(id);
  }
}

export default DeleteTransactionService;
