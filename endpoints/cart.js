const router = require('express').Router()

/* root: /cart */

// GET todos los items del carrito
router.get('/', (req, res) => {
  const cart = router.db.getState().cart
  res.send(cart)
})

// POST agregar item al carrito
router.post('/', (req, res) => {
  const { itemId, quantity } = req.body

  if (!itemId || !quantity) {
    res.status(400).send({ message: 'itemId and quantity are required' })
    return
  }

  const cart = router.db.getState().cart
  const existingItem = cart.find((item) => item.itemId === itemId)

  if (existingItem) {
    // Si el item ya existe, incrementar la cantidad
    existingItem.quantity += quantity
    router.db.get('cart').write()
    res.status(200).send({ message: 'Item quantity updated', item: existingItem })
  } else {
    // Agregar nuevo item al carrito
    const items = router.db.getState().items
    const product = items.find((item) => item.id === itemId)

    if (!product) {
      res.status(404).send({ message: 'Product not found' })
      return
    }

    const cartItem = {
      id: require('uuid').v4(),
      itemId,
      product_name: product.product_name,
      price: product.price,
      quantity,
      addedAt: Date.now()
    }

    router.db.get('cart').push(cartItem).write()
    res.status(201).send({ message: 'Item added to cart', item: cartItem })
  }
})

// DELETE remover item del carrito
router.delete('/:itemId', (req, res) => {
  const { itemId } = req.params
  const cart = router.db.getState().cart
  const index = cart.findIndex((item) => item.itemId === itemId)

  if (index === -1) {
    res.status(404).send({ message: 'Item not found in cart' })
    return
  }

  const removedItem = cart[index]
  router.db.get('cart').splice(index, 1).write()
  res.send({ message: 'Item removed from cart', item: removedItem })
})

// DELETE vaciar carrito
router.delete('/', (req, res) => {
  router.db.get('cart').remove().write()
  router.db.set('cart', []).write()
  res.send({ message: 'Cart cleared' })
})

module.exports = router
