import fs from 'fs';
import csvParse from 'csv-parse';
import CreateTransactionService, {
  TypesTransaction,
} from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface RequestDTO {
  filePath: string;
}

interface LineTransacion {
  title: string;
  type: TypesTransaction;
  value: number;
  category: string;
}

const loadCSV = async (filePath: string): Promise<LineTransacion[]> => {
  const parse = csvParse({ fromLine: 2, trim: true });
  const readStream = fs.createReadStream(filePath);
  const lines: LineTransacion[] = [];
  const csvParsed = readStream.pipe(parse);

  csvParsed.on('data', line => {
    const [title, type, value, category] = line;
    const linha: LineTransacion = { title, type, value, category };

    lines.push(linha);
  });

  await new Promise(resolve => {
    csvParsed.on('end', resolve);
  });

  return lines;
};
class ImportTransactionsService {
  async execute({ filePath }: RequestDTO): Promise<Transaction[]> {
    const transactions = await loadCSV(filePath);
    const createService = new CreateTransactionService();
    const transactionsImported: Transaction[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const oneTransaction of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createService.execute(oneTransaction);
      transactionsImported.push(transaction);
    }

    await fs.promises.unlink(filePath);

    return transactionsImported;
  }
}

export default ImportTransactionsService;
