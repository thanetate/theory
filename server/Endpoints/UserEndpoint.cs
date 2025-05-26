using Supabase.Tutorial.Contracts;
using Supabase.Tutorial.Models;
using Newtonsoft.Json.Linq;
using Stripe;

//Todo: move these to a model
public class CartItem
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int Price { get; set; }
    public string? Image { get; set; }
    public string? Size { get; set; }
    public int Quantity { get; set; }
}

public class OrdersItem
{
    public string? Description { get; set; }
    public string? Id { get; set; }
    public int Quantity { get; set; }

    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Line1 { get; set; }
    public string? Line2 { get; set; }
    public string? PostalCode { get; set; }
    public string? State { get; set; }
    public string? Size { get; set; }
}

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        // GET user
        app.MapGet("/user/{id:guid}", async (Guid id, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == id)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {id} not found");
            }

            // deserialize the cart
            if (user.Cart != null && user.Cart.Count == 0)
            {
                user.Cart = new List<CartItem>();
            }

            var userResponse = new UserResponse
            {
                Id = user.Id,
                Cart = user.Cart?.Select(item => JObject.FromObject(item)).ToList() ?? new List<JObject>()
            };

            return Results.Ok(userResponse);
        });

        // GET all items in user cart
        app.MapGet("/user/{id:guid}/cart", async (Guid id, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == id)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {id} not found");
            }

            var cart = user.Cart ?? new List<CartItem>();
            return Results.Ok(cart);
        });

        // POST add item to users cart
        app.MapPost("/user/{id:guid}/add-to-cart", async (Guid id, CartItem cartItem, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == id)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {id} not found");
            }

            var updatedCart = user.Cart ?? new List<CartItem>();
            updatedCart.Add(cartItem);
            user.Cart = updatedCart;
            await client.From<User>().Update(user);

            return Results.Ok(new { Message = "Item added to cart", Cart = updatedCart });
        });

        // PUT update quantity in users cart
        app.MapPatch("/user/{userId:guid}/cart/{productId}/quantity/{newQuantity}", async (
            Guid userId,
            string productId,
            int newQuantity,
            Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == userId)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {userId} not found");
            }

            var updatedCart = user.Cart ?? new List<CartItem>();

            // make sure productId is a int
            if (!int.TryParse(productId, out int productIdInt))
            {
                return Results.BadRequest($"Invalid product id {productId}");
            }

            var existingItem = updatedCart.FirstOrDefault(c => c.Id == productIdInt);

            if (existingItem == null)
            {
                return Results.NotFound($"Product with id {productId} not found in cart");
            }

            existingItem.Quantity = newQuantity;
            user.Cart = updatedCart;
            await client.From<User>().Update(user);

            return Results.Ok(new { Message = "Cart item quantity updated", Cart = updatedCart });
        });


        // DELETE one item from cart
        app.MapDelete("/user/{userId:guid}/cart/{productId}", async (Guid userId, string productId, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == userId)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {userId} not found");
            }

            var updatedCart = user.Cart ?? new List<CartItem>();

            if (!int.TryParse(productId, out int productIdInt))
            {
                return Results.BadRequest($"Invalid product id {productId}");
            }

            var itemToRemove = updatedCart.FirstOrDefault(c => c.Id == productIdInt);

            if (itemToRemove == null)
            {
                return Results.NotFound($"Product with id {productId} not found in cart");
            }

            updatedCart.Remove(itemToRemove);
            user.Cart = updatedCart;
            await client.From<User>().Update(user);

            return Results.Ok(new { Message = "Item removed from cart", Cart = updatedCart });
        });

        // DELETE all items from users cart
        app.MapDelete("/user/{userId:guid}/cart", async (Guid userId, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == userId)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {userId} not found");
            }

            user.Cart = new List<CartItem>();
            await client.From<User>().Update(user);

            return Results.Ok(new { Message = "Cart cleared", Cart = user.Cart });
        });

        // GET users orders
        app.MapGet("/user/{id:guid}/orders", async (Guid id, Supabase.Client client) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == id)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {id} not found");
            }

            var orders = user.Orders ?? new List<OrdersItem>();
            return Results.Ok(orders);
        });

        // POST create an order
        app.MapPost("/user/{id:guid}/add-to-orders", async (
            Guid id,
            List<OrdersItem> ordersItems,
            Supabase.Client client
        ) =>
        {
            var response = await client
                .From<User>()
                .Where(p => p.Id == id)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return Results.NotFound($"User with id {id} not found");
            }

            var updatedOrders = user.Orders ?? new List<OrdersItem>();
            updatedOrders.AddRange(ordersItems);

            await client.From<User>().Update(new User
            {
                Id = user.Id,
                Orders = updatedOrders
            });

            return Results.Ok(new { Message = "Items added to orders", Order = updatedOrders });
        });

        // app.MapPost("/user/{id:guid}/add-to-orders", async (Guid id, OrdersItem ordersItem, Supabase.Client client) =>
        // {
        //     var response = await client
        //         .From<User>()
        //         .Where(p => p.Id == id)
        //         .Get();

        //     var user = response.Models.FirstOrDefault();

        //     if (user == null)
        //     {
        //         return Results.NotFound($"User with id {id} not found");
        //     }

        //     var updatedOrder = user.Orders ?? new List<OrdersItem>();
        //     updatedOrder.Add(ordersItem);
        //     // user.Orders = updatedOrder;
        //     // await client.From<User>().Update(user);
        //     await client.From<User>().Update(new User
        //     {
        //         Id = user.Id,
        //         Orders = updatedOrder
        //     });

        //     return Results.Ok(new { Message = "Items added to orders", Order = updatedOrder });
        // });



    }
}