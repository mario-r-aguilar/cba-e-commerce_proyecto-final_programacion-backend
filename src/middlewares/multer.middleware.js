import multer from 'multer';
import path from 'node:path';
import getDirname from '../utils/utils.js';

const __dirname = getDirname(import.meta.url);

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let uploadPath = '';
		if (file.fieldname === 'profileImage') {
			uploadPath = path.join(__dirname, '../public/img/profiles/');
		} else if (file.fieldname === 'productImage') {
			uploadPath = path.join(__dirname, '../public/img/usersProducts/');
		} else if (file.fieldname === 'userDocument') {
			uploadPath = path.join(__dirname, '../public/userDocuments/');
		} else if (
			file.fieldname === 'personal-identification' ||
			file.fieldname === 'proof-of-address' ||
			file.fieldname === 'proof-of-account-status'
		) {
			uploadPath = path.join(__dirname, '../public/userDocuments/');
		}
		cb(null, uploadPath);
	},

	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
		const ext = path.extname(file.originalname);
		const filename = file.fieldname + '-' + uniqueSuffix + ext;
		cb(null, filename);
	},
});

// Validación para comprobar que solo se están subiendo los tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
	// Permitir solo imágenes JPEG o PNG
	if (file.fieldname === 'profileImage' || file.fieldname === 'productImage') {
		if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
			cb(null, true);
		} else {
			cb(
				new Error(
					'Invalid file type. Only JPEG and PNG images are allowed.'
				)
			);
		}
		// Permitir solo archivos PDF
	} else if (
		file.fieldname === 'userDocument' ||
		file.fieldname === 'personal-identification' ||
		file.fieldname === 'proof-of-address' ||
		file.fieldname === 'proof-of-account-status'
	) {
		if (file.mimetype === 'application/pdf') {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only PDF files are allowed.'));
		}
	} else {
		// Campo desconocido, rechazar archivo
		cb(new Error('Unknown fieldname.'));
	}
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
