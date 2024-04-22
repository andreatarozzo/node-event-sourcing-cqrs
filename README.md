# Event sourcing & CQRS in node

This is a simple project to showcase the implementation of the Event sourcing & CQRS patterns in node.

## Brief introduction to Sourcing

The Event Sourcing Pattern can be described as an alternative way of storing data, or to be more precise, the state of entities in the database.

Instead of storing just the last, most updated, state of an entity in our system and applying the different changes that might occur to it directly ( as it happens with the CRUD model ) when using event sourcing we store all the events that mutated the state of our entity in chronological order as a stream of events.

Events can be intended as facts that happened in our system/business and the source of our system information, they must be immutable and stored with append-only operations. <br>
Because of the immutability of events this pattern is a very good fit for financial institution because the events store acts as a lodger providing a high degree of observability into the system state's changes.

![event-sourcing-example](images/event-sourcing.png)

### Event sourcing PROs

One of the biggest advantages of using Event Sourcing is the possibility of recovering the state of any entity in the system by just replaying the events stream associated with it.

This pattern can also help in preventing conflicts caused by concurrent updates because the final state of an entity is built using events and it's not updated directly.

With event sourcing it is very easy to go through auditing processes because of it's append-only operation restriction which gives a clear picture of how exactly an entity mutated through time.

The event source patter is excellent for real-time data reporting when used in conjunction with an event-driven message broker.

### Event sourcing CONs

A system implementing event sourcing can only be eventually consistent while generating projection of data made by replaying the events stored for a given entity. <br>
That's because during this computation new events might be added to the event store after the computation is started which might result in an entity state not fully up to date.

Because the events store is considered the ultimate source of truth a change in the events model might be very tricky and require to update all the already stored events before starting using the new events model.

When handling entities with a large number of events associated to them the data retrieval process can be slow but this issue can be easily fix with the adoption of snapshots.

## Brief introduction to CQRS (Command Query Responsibility Segregation)

CQRS is an architectural pattern which aims to completely separate the write operations that can alter data / state of an entity in our storage ( Command ) from the read operations to query and return the data / state related to an entity currently saved in storage ( Query ).

It is possible to perform a partial separation where the commands and queries are logically separated in different models within the code but it is possible to push the CQRS concept even further employing totally separated services and databases to achieve a full separation. <br>
When full separation is achieved we can get all the benefits that CQRS can provide.

This patter associate itself very well with Event Sourcing considering that commands can be used to generate events and query can be used to return the data / entities state.

### CQRS PROs

The CQRS pattern will bring improved security through isolation. <br>
Because the reads operations are separated from the write operations different permissions can be assigned to the services, one can have a simple read-only permission while the other can have a write permission.

In a context of full separation the CQRS pattern can positively impact on the performance of the system, especially when we do not have a balance between the amount of requests between write commands and query. <br>
Because the write service and database are separated from the read service and database in case of a spike in requests including, for example, write commands, we are not going to negatively impact the performance of the read service nor its database, reducing the overall latency on that front. <br>
To keep things simple in this project everything sits in a monolith but, because of this pattern, it would be very easy to extract the logic to handle commands and queries and implement a distinct service for each.

CQRS also offers enhanced scalability. <br>
By segregating commands and queries, and having them managed by distinct services, it becomes possible to scale only the component of the system that is experiencing higher demand.

### CQRS CONs

Implementing CQRS can add complexity to your system and involve a steep learning curve if somebody is not familiar with the pattern.

This pattern can result in situations where query models do not instantly showcase the latest modifications executed by commands, necessitating meticulous management and coordination.

In a situation where a system has completely segregated its write operations from its read operations, and even utilizes separate databases for each, the implementation of CQRS introduces additional potential points of failure within the system.

## How to test locally

To have this sample project running in your local machine use docker-compose.

```
docker-compose build && docker-compose up
```


A postman collection is also present within the repo to make it easy to play around with the project.

## **System Routes**

<br>

**Auth Routes**

Very very simple auth logic.

| METHOD | BASE PATH | PATH  | DESCRIPTION                                                                                                    |
| ------ | --------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| POST   | /auth/v1  | login | Checks user credentials and generate a JWT token that then need to be passed with each command / query request |

> Body Parameters

```
{
  "user_id": string, ( use: "test" )
  "password": string ( use: "test" )
}
```

> Response Example:

```
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdCIsImlhdCI6MTY1NjU5MDg1NSwiZXhwIjoyMDg4NTkwODU1fQ.WKAokaiKTum13EflpglaFkmb8GVQElR_7CS4EOv6Vgc"
}
```

---

<br>
<br>

**User Command Routes**

> Account Command Types Available

- CreateNewUserCommand
- ChangeUserAddressCommand

<br>
<br>

| METHOD | BASE PATH        | PATH            | DESCRIPTION                                         |
| ------ | ---------------- | --------------- | --------------------------------------------------- |
| POST   | /command/user/v1 | create-new-user | Generates the events related to a new user creation |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": "string",
    "timestamp": "string" ( ISO ),
    "user_name": "string",
    "data": {
        "address": "string"
    }
}

Example:
{
    "type": "CreateNewUserCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "user_name": "Test Postman User",
    "data": {
        "address": "Test Address"
    }
}
```

> Response Example:

```
{
    "success": true,
    "events_saved": [
        {
            "type": "UserCreatedEvent",
            "user_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "user_name": "Test Postman User",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "address": "Test Address"
            },
            "_id": "62bd7de8e7db50e73760a9c9",
            "__v": 0
        }
    ]
}
```

<br>

---

| METHOD | BASE PATH        | PATH               | DESCRIPTION                                           |
| ------ | ---------------- | ------------------ | ----------------------------------------------------- |
| POST   | /command/user/v1 | change-user-addres | Generates the events related to a user address change |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": string,
    "timestamp": string, ( ISO )
    "user_name": string,
    "user_id": string,
    "data": {
        "address": string,
        "previous_address": string
    }
}

Example:
{
    "type": "ChangeUserAddressCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "user_name": "Test Postman User",
    "user_id": "asd123",
    "data": {
        "address": "New New Address",
        "previous_address": "New Address"
    }
}
```

> Response Example:

```
{
    "success": true,
    "events_saved": [
        {
            "type": "UserAddressChangedEvent",
            "user_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "user_name": "Test Postman User",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "address": "New New Address",
                "previous_address": "New Address"
            },
            "_id": "62bd7deae7db50e73760a9cc",
            "__v": 0
        }
    ]
}
```

<br>
<br>

**Acount Command Routes**

> User Command Types Available

- CreateNewAccountCommand
- ChangeAccountTypeCommand

<br>
<br>

| METHOD | BASE PATH           | PATH               | DESCRIPTION                                                                                                                                                  |
| ------ | ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | /command/account/v1 | create-new-account | Generates the events related the creation of a new account and generate a transaction event ( deposit ) with an amount equal to the initial_balance provided |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": string,
    "timestamp": string, ( ISO )
    "owner_id": string,
    "branch_id": string,
    "terminal_id": string,
    "is_active": boolean,
    "account_type": string, ( private | commercial )
    "data": {
        "initial_balance": number
    }
}

Example:
{
    "type": "CreateNewAccountCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "owner_id": "123asd",
    "branch_id": "1",
    "terminal_id": "1",
    "is_active": true,
    "account_type": "private",
    "data": {
        "initial_balance": 2000
    }
}
```

> Response Example:

```
{
    "success": true,
    "account_events_saved": [
        {
            "type": "AccountCreatedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "private",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "initial_balance": 2000
            },
            "_id": "62bd7dece7db50e73760a9cf",
            "__v": 0
        }
    ],
    "transaction_events_saved": [
        {
            "type": "AmountDepositedEvent",
            "transaction_id": "2fb298c1-a2e1-425d-b3dc-b8c9ee57777c",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 2000,
            "data": {}
        }
    ]
}
```

<br>

| METHOD | BASE PATH           | PATH                | DESCRIPTION                                                 |
| ------ | ------------------- | ------------------- | ----------------------------------------------------------- |
| POST   | /command/account/v1 | change-account-type | Generates the events related to a change in an account type |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": string,
    "timestamp": string, ( ISO )
    "account_id": string,
    "owner_id": string,
    "branch_id": string,
    "is_active": boolean,
    "account_type": string, ( private | commercial )
    "data": {
        "previous_account_type": string ( private | commercial )
    }
}

Example:
{
    "type": "ChangeAccountTypeCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "account_id": "asd",
    "owner_id": "asd123",
    "branch_id": "1",
    "is_active": true,
    "account_type": "commercial",
    "data": {
        "previous_account_type": "private"
    }
}
```

> Response Example:

```
{
    "success": true,
    "events_saved": [
        {
            "type": "AccountTypeChangedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "commercial",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "previous_account_type": "private"
            },
            "_id": "62bd7deee7db50e73760a9d6",
            "__v": 0
        }
    ]
}
```

<br>
<br>

**Transaction Command Routes**

> Transaction Command Types Available

- DepositAmountCommand
- TransferAmountCommand

<br>
<br>

| METHOD | BASE PATH               | PATH           | DESCRIPTION                                               |
| ------ | ----------------------- | -------------- | --------------------------------------------------------- |
| POST   | /command/transaction/v1 | deposit-amount | Generates the events related to a deposit into an account |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": string,
    "timestamp": string, ( ISO )
    "receiver_id": string,
    "receiver_account_id": string,
    "amount": number,
    "terminal_id": string,
    "branch_id": string,
    "data": {}
}

Example:
{
    "type": "DepositAmountCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "receiver_id": "asd",
    "receiver_account_id": "asd123",
    "amount": 100,
    "terminal_id": "1",
    "branch_id": "1",
    "data": {}
}
```

> Response Example:

```
{
    "success": true,
    "events_saved": [
        {
            "type": "AmountDepositedEvent",
            "transaction_id": "46392e88-e26f-4f97-99ae-1c0936bfb58c",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 100,
            "data": {}
        }
    ]
}
```

<br>

| METHOD | BASE PATH               | PATH            | DESCRIPTION                                                 |
| ------ | ----------------------- | --------------- | ----------------------------------------------------------- |
| POST   | /command/transaction/v1 | transfer-amount | Generates the events related to a transfer between accounts |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Body Parameters

```
{
    "type": string,
    "timestamp": string, ( ISO )
    "sender_id": string,
    "sender_account_id": string,
    "receiver_id": string,
    "receiver_account_id": string,
    "amount": number,
    "terminal_id": string,
    "branch_id": string,
    "data": {}
}

Example:
{
    "type": "TransferAmountCommand",
    "timestamp": "2022-02-06T17:53:39.000Z",
    "sender_id": "asd",
    "sender_account_id": "asd123",
    "receiver_id": "2",
    "receiver_account_id": "2",
    "amount": 500,
    "terminal_id": "1",
    "branch_id": "1",
    "data": {}
}
```

> Response Example:

```
{
    "success": true,
    "events_saved": [
        {
            "type": "AmountTransferedEvent",
            "transaction_id": "b404b72a-648c-420c-a68b-35b09c639af6",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "sender_id": "41744dc7-77cc-4e79-974f-625343c0c0bc",
            "sender_account_id": "d43fed69-7db4-4b61-8502-d93ae190ec41",
            "receiver_id": "2",
            "receiver_account_id": "2",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 500,
            "data": {}
        }
    ]
}
```

<br>
<br>

**User Query Routes**

<br>

| METHOD | BASE PATH      | PATH                     | DESCRIPTION              |
| ------ | -------------- | ------------------------ | ------------------------ |
| GET    | /query/user/v1 | get-user-profile-history | Get user profile history |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
user_id: string
```

> Response Example:

```
{
    "user": {
        "id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "name": "Test Postman User",
        "address": "New New Address"
    },
    "history": [
        {
            "_id": "62bd7de8e7db50e73760a9c9",
            "type": "UserCreatedEvent",
            "user_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "user_name": "Test Postman User",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "address": "New New Address"
            },
            "__v": 0
        },
        {
            "_id": "62bd7deae7db50e73760a9cc",
            "type": "UserAddressChangedEvent",
            "user_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "user_name": "Test Postman User",
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "address": "New New Address",
                "previous_address": "New Address"
            },
            "__v": 0
        }
    ]
}
```

<br>

| METHOD | BASE PATH      | PATH                   | DESCRIPTION                                    |
| ------ | -------------- | ---------------------- | ---------------------------------------------- |
| GET    | /query/user/v1 | get-user-accounts-info | Get info about all accounts linked to the user |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
user_id: string
```

> Response Example:

```
{
    "user": {
        "id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "name": "Test Postman User",
        "address": "New New Address"
    },
    "accounts": [
        {
            "id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "commercial",
            "is_active": true
        }
    ]
}
```

<br>

| METHOD | BASE PATH      | PATH                  | DESCRIPTION                                          |
| ------ | -------------- | --------------------- | ---------------------------------------------------- |
| GET    | /query/user/v1 | get-user-transactions | Get all user transactions ( Deposits and Transfers ) |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
user_id: string
```

> Response Example:

```
{
    "user": {
        "id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "name": "Test Postman User",
        "address": "New New Address"
    },
    "transactions_history": [
        {
            "_id": "62bd7dece7db50e73760a9d3",
            "type": "AmountDepositedEvent",
            "transaction_id": "2fb298c1-a2e1-425d-b3dc-b8c9ee57777c",
            "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 2000,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {},
            "__v": 0
        }
    ]
}
```

<br>
<br>

**Account Query Routes**

<br>

| METHOD | BASE PATH         | PATH                     | DESCRIPTION                                                                               |
| ------ | ----------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| GET    | /query/account/v1 | get-account-full-history | Get account full history ( entity history and transactions history) alongside the balance |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
account_id: string
```

> Response Example:

```
{
    "account": {
        "id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
        "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "branch_id": "1",
        "account_type": "commercial",
        "is_active": true
    },
    "balance": 2000,
    "account_history": [
        {
            "_id": "62bd7dece7db50e73760a9cf",
            "type": "AccountCreatedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "private",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "initial_balance": 2000
            },
            "__v": 0
        },
        {
            "_id": "62bd7deee7db50e73760a9d6",
            "type": "AccountTypeChangedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "commercial",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "previous_account_type": "private"
            },
            "__v": 0
        }
    ],
    "transactions_history": [
        {
            "_id": "62bd7dece7db50e73760a9d3",
            "type": "AmountDepositedEvent",
            "transaction_id": "2fb298c1-a2e1-425d-b3dc-b8c9ee57777c",
            "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 2000,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {},
            "__v": 0
        }
    ]
}
```

<br>

| METHOD | BASE PATH         | PATH                            | DESCRIPTION                      |
| ------ | ----------------- | ------------------------------- | -------------------------------- |
| GET    | /query/account/v1 | get-account-transaction-history | Get account transactions history |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
account_id: string
```

> Response Example:

```
{
    "account": {
        "id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
        "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "branch_id": "1",
        "account_type": "commercial",
        "is_active": true
    },
    "transactions_history": [
        {
            "_id": "62bd7dece7db50e73760a9d3",
            "type": "AmountDepositedEvent",
            "transaction_id": "2fb298c1-a2e1-425d-b3dc-b8c9ee57777c",
            "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "terminal_id": "1",
            "branch_id": "1",
            "amount": 2000,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {},
            "__v": 0
        }
    ]
}
```

<br>

| METHOD | BASE PATH         | PATH                | DESCRIPTION         |
| ------ | ----------------- | ------------------- | ------------------- |
| GET    | /query/account/v1 | get-account-balance | Get account balance |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
account_id: string
```

> Response Example:

```
{
    "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
    "balance": 100
}
```

<br>

| METHOD | BASE PATH         | PATH                       | DESCRIPTION                |
| ------ | ----------------- | -------------------------- | -------------------------- |
| GET    | /query/account/v1 | get-account-entity-history | Get account entity history |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
account_id: string
```

<br>

> Response Example:

```
{
    "account": {
        "id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
        "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
        "branch_id": "1",
        "account_type": "commercial",
        "is_active": true
    },
    "history": [
        {
            "_id": "62bd7dece7db50e73760a9cf",
            "type": "AccountCreatedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "private",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "initial_balance": 2000
            },
            "__v": 0
        },
        {
            "_id": "62bd7deee7db50e73760a9d6",
            "type": "AccountTypeChangedEvent",
            "account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
            "owner_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
            "branch_id": "1",
            "account_type": "commercial",
            "is_active": true,
            "timestamp": "2022-02-06T17:53:39.000Z",
            "data": {
                "previous_account_type": "private"
            },
            "__v": 0
        }
    ]
}
```

<br>
<br>

**Transaction Query Routes**

<br>

| METHOD | BASE PATH             | PATH                              | DESCRIPTION                |
| ------ | --------------------- | --------------------------------- | -------------------------- |
| GET    | /query/transaction/v1 | get-transaction-by-transaction-id | Get account entity history |

> Headers

- Authorisation: Bearer <JWT_TOKEN>

> Query Parameters

```
transaction_id: string
```

> Response Example:

```
{
    "_id": "62bd7dece7db50e73760a9d3",
    "type": "AmountDepositedEvent",
    "transaction_id": "2fb298c1-a2e1-425d-b3dc-b8c9ee57777c",
    "receiver_id": "6b714330-8f9f-4ef9-81d8-46bac8da6d12",
    "receiver_account_id": "2cac339b-68ac-4edb-b33f-146bc6ad9d72",
    "terminal_id": "1",
    "branch_id": "1",
    "amount": 2000,
    "timestamp": "2022-02-06T17:53:39.000Z",
    "data": {},
    "__v": 0
}
```
