using Swashbuckle.AspNetCore.SwaggerGen;
using Supabase;
using Supabase.Interfaces;
using Supabase.Tutorial.Contracts;
using Supabase.Tutorial.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using Stripe;
using Stripe.Checkout;
using YourNamespace.Models;
using YourNamespace.Contracts;

//test comment
// initialize the web application
var builder = WebApplication.CreateBuilder(args);

// adds services to the dependency injection container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();

// add Authentication
var bytes = Encoding.UTF8.GetBytes(builder.Configuration["JwtSecret"]!);
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(bytes),
        ValidAudience = builder.Configuration["ValidAudience"],
        ValidIssuer = builder.Configuration["ValidIssuer"]
    };
});

// add CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowViteClient",
    policy => policy.WithOrigins("https://theory.thanetate.dev") 
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
    );
});

//connection to supabase
builder.Services.AddScoped<Supabase.Client>(_ =>
{
    var supabaseUrl = builder.Configuration["SupabaseUrl"];
    var supabaseKey = builder.Configuration["SupabaseKey"];

    if (string.IsNullOrEmpty(supabaseUrl))
    {
        throw new ArgumentNullException(nameof(supabaseUrl), "SupabaseUrl cannot be null or empty.");
    }

    if (string.IsNullOrEmpty(supabaseKey))
    {
        throw new ArgumentNullException(nameof(supabaseKey), "SupabaseKey cannot be null or empty.");
    }

    return new Supabase.Client(
        supabaseUrl,
        supabaseKey,
        new SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        }
    );
});

// stripe configuration
StripeConfiguration.ApiKey = builder.Configuration["StripeSecretKey"];

// build the web application
var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowViteClient");

// adds swagger UI in development environment
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

// endpoints
app.MapProductEndpoints();
app.MapUserEndpoints();

// stripe endpoint
app.MapPost("/create-checkout-session", async (HttpContext context) =>
{
    var domain = "https://theory.thanetate.dev"; 

    // read cart details from the request body
    var body = await context.Request.ReadFromJsonAsync<CartRequest>();

    // error handling
    if (body == null || body.Cart == null || !body.Cart.Any())
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = "Cart is empty or invalid." });
        return;
    }

    // map cart details to Stripe LineItems
    var lineItems = body.Cart.Select(item => new SessionLineItemOptions
    {
        PriceData = new SessionLineItemPriceDataOptions
        {
            Currency = "usd",
            ProductData = new SessionLineItemPriceDataProductDataOptions
            {
                Name = item.Name,
                Description = item.Description,
            },
            UnitAmount = item.Price * 100,
        },
        Quantity = item.Quantity,
    }).ToList();

    // collect additional information using Metadata
    var metadata = body.Cart.ToDictionary(
        item => item.Name ?? string.Empty, //key
        item => item.Size ?? string.Empty  //value
    );

    // create a Stripe session with the dynamically generated LineItems
    var options = new SessionCreateOptions
    {
        LineItems = lineItems,
        ShippingAddressCollection = new Stripe.Checkout.SessionShippingAddressCollectionOptions
        {
            AllowedCountries = new List<string> { "US" },
        },
        // ShippingOptions = new List<Stripe.Checkout.SessionShippingOptionOptions>
        // {
        //     new Stripe.Checkout.SessionShippingOptionOptions
        //     {
        //          ShippingRateData = new Stripe.Checkout.SessionShippingOptionShippingRateDataOptions
        //          {
        //             Type = "fixed_amount",
        //             FixedAmount = new Stripe.Checkout.SessionShippingOptionShippingRateDataFixedAmountOptions
        //             {
        //                 Amount = 500,
        //                 Currency= "usd",
        //             },
        //          },
        //     },
        // },
        Mode = "payment",
        SuccessUrl = $"{domain}/#/account?session_id={{CHECKOUT_SESSION_ID}}",
        CancelUrl = $"{domain}/#/cart",
        AutomaticTax = new Stripe.Checkout.SessionAutomaticTaxOptions { Enabled = true },
        Metadata = metadata
    };

    var service = new SessionService();
    var session = service.Create(options);

    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(new { url = session.Url });
});

// get line items from session
app.MapGet("/get-line-items", async (HttpContext context) =>
{
    var session_id = context.Request.Query["session_id"];
    var service = new Stripe.Checkout.SessionLineItemService();
    StripeList<LineItem> lineItems = service.List(session_id);

    // return line items in response
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(lineItems);
});

// get shipping details from session
app.MapGet("/get-shipping-details", async (HttpContext context) =>
{
    var sessionId = context.Request.Query["session_id"];

    // make sure you have session id
    if (string.IsNullOrEmpty(sessionId))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Session ID is required.");
        return;
    }

    // get checkout session from stripe
    var sessionService = new Stripe.Checkout.SessionService();
    var session = await sessionService.GetAsync(sessionId);

    // retrieve payment intent details
    var paymentIntentService = new Stripe.PaymentIntentService();
    var paymentIntent = await paymentIntentService.GetAsync(session.PaymentIntentId);

    // return shipping details in response
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(paymentIntent.Shipping.Address);
});

// get metadata from session
app.MapGet("/get-checkout-session-metadata", async (HttpContext context) =>
{
    var sessionId = context.Request.Query["session_id"];

    // make sure you have session id
    if (string.IsNullOrEmpty(sessionId))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync("Session ID is required.");
        return;
    }

    // get session from stripe
    var sessionService = new Stripe.Checkout.SessionService();
    var session = await sessionService.GetAsync(sessionId);

    // Extract metadata from session
    var metadata = session.Metadata;

    context.Response.ContentType = "application/json";
    await context.Response.WriteAsJsonAsync(new { metadata });
});

app.Run();