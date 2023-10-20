export default class Cart{

    constructor(){
        this.cart = [];

        this.add = (title, price, quantity, imgSrc, id) =>{
            this.cart.push({title, price, quantity, imgSrc, id});
        }
        this.checkout = () => {
            this.cart.removeAll();
            localStorage.removeItem("Arte-Cart");
        }
        this.getTotal = () =>{
            let total = 0;
            this.cart.forEach( (item) =>{
                total += item.price * item.quantity
            })
        }
        this.saveCartLocally = () =>{
            localStorage.setItem('Arte-Cart', JSON.stringify(this.cart))
        }
    };
    
}

export function getCartFromLocal(){
    return JSON.parse(localStorage.getItem('Arte-Cart')) || [] ;
}