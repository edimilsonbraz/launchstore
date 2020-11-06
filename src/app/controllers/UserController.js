const { hash } = require('bcryptjs')
const fs = require('fs')
const LoadProductService = require('../services/LoadProductService')

const User = require('../models/User')
const Product = require('../models/Product')

const { formatCep, formatCpfCnpj } = require('../../lib/utils')


module.exports = {
    registerForm(req, res) {

        return res.render("user/register")
    },
    async show(req, res) {
        try {
            const { user } = req

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)

            return res.render('user/index', { user })

        } catch (error) {
            console.error(error);
        }

    },
    async post(req, res) {
        try {
            let { name, email, password, cpf_cnpj, cep, address } = req.body

            password = await hash(password, 8)
            cpf_cnpj = cpf_cnpj.replace(/\D/g, "") //ir só os números
            cep = cep.replace(/\D/g, "")

            const userId = await User.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            })

            req.session.userId = userId

            return res.redirect('/users')

        } catch (error) {
            console.error(error);
        }

    },
    async update(req, res) {
        try {
            const { user } = req
            let { name, email, cpf_cnpj, cep, address } = req.body


            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })

            return res.render("user/index", {
                user: req.body,
                success: "Conta atualizada com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render("user/index", {
                error: "Algum erro aconteceu!"
            })
        }
    },
    async delete(req, res) {
        try {
            const products = await Product.findAll({ where: { user_id: req.body.id } })

            //dos produtos, pegar todas as imagens
            const allFilesPromise = products.map(product =>
                Product.files(product.id))

            let promiseResults = await Promise.all(allFilesPromise)

            //rodar a remoção do usuároo
            await User.delete(req.body.id)
            req.session.destroy()

            //remover as imagens da pasta public
            promiseResults.map(files => {
                files.map(file => {
                    try {
                        fs.unlinkSync(file.path)
                    } catch (err) {
                        console.error(err)
                    }
                })
            })

            return res.render("session/login", {
                success: "Conta deletada com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render("user/index", {
                user: req.body,
                error: "Error ao tentar deletar sua conta!"
            })
        }
    },
    async ads(req, res) {
        const products = await LoadProductService.load('products', {
            where: { user_id: req.session.userId }
        })

        return res.render("user/ads", { products})
    }

}