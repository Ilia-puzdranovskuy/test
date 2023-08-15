const { text } = require('body-parser');



let config = require('../config');
const { Telegraf, session, Scenes:{WizardScene, Stage}, Markup } = require('telegraf');
let token = require('../config').telBotToken;
const bot = new Telegraf(token);
const store = new Map();
bot.use(session({ store }));

const regex = /^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9:" .]+$/g;




exports.mesForAll= async (imageUrl,text) => {
    let query= `SELECT telegram_ac_id
    FROM telegrams_users`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        for (let i = 0; i < parseRes.length; i++) {
            const element = parseRes[i];
            bot.telegram.sendPhoto(`${element.telegram_ac_id}`, {url: imageUrl}, {caption: text})
        }
    });

}    

exports.personalMes= async (telId,imageUrl,text) => {
    bot.telegram.sendPhoto(`${telId}`, {url: imageUrl}, {caption: text})

}    






bot.command('start', async ctx => {
    console.log(ctx.chat)
    let query = `SELECT * 
    FROM telegrams_users
    WHERE telegram_ac_id =  '${ctx.from.id}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        if(result.length ==0){
                let query = `INSERT INTO telegrams_users (telegram_ac_id)
                VALUES ('${ctx.from.id}');`;
                connection.query(query, async(err, result) => {
                    if (err) {
                        console.log("internal error", err);
                        return;
                    }
                })
            
        }
        ctx.reply('Доброго дня, я бот КП "ВІНЬКОВЕЦЬКИЙ КОМУНСЕРВІС", завдяки мені ви зможете передавати ваші показники через Telegram',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
        }
        });

    })
    
})

bot.hears('Наш вебсайт', async ctx => {
        ctx.reply('Для відвідання нашого вебсайту перейдіть за посиланям знизу',
        {reply_markup: {
            inline_keyboard:[
                [
                {text:"Відвідати вебсайт",url:config.urlIndex}
                ]
            ],
            resize_keyboard:true
        }
        });
})




//// Передавання показників
const addNewReadinStart = Telegraf.on("text", async (ctx) => {
    return ctx.wizard.next();
    
})

const chosePersAc = Telegraf.on("text", async (ctx) => {
    let regex1 =/^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9.:", ]+$/g;
    regex1.lastIndex = 0;
    if(regex1.exec(ctx.message.text)!=null){
            let curentPersAc = ctx.message.text.split(/\"(.*?)\"/gm)[1]
            ctx.session.curentPersAc = curentPersAc;
            let query= `SELECT meters.*
            FROM personal_accounts
            INNER JOIN meters
            ON personal_accounts.id_personal_account = meters.personal_account_id
            WHERE personal_account = ${ctx.session.curentPersAc}`;
            connection.query(query, async(err, result) => {
                if (err) {
                    console.log("internal error", err);
                    ctx.reply('Виберіть особовий рахунок зі списку!',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                    
                }
                let parseRes = JSON.parse(JSON.stringify(result));
                let metersForKeyboard = [];
                if(parseRes!=undefined&&parseRes.length!=0){
                    for (let i = 0; i < parseRes.length; i++) {
                        const element = parseRes[i];

                        let serilNum = 'Невідомо';
                        let location = 'Невідомо';

                        if(element.serial_number !=undefined){
                            serilNum  = element.serial_number
                        }
                        if(element.location !=undefined){
                            location = element.location
                        }
                        

                        if(element.status == "Активний"){
                            metersForKeyboard.push({text:`${element.id_meters} Серійн.ном. ліч.: ${serilNum}, місце встановлення: ${location}, останні показання: ${element.last_readinng}`})
                        }
                    }
                }
                if(metersForKeyboard.length==0){
                    ctx.reply('Вибачте, але за даним особовим рахунком немає активних лічильників',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                    
                }else{
                    ctx.reply('Виберіть лічильник',
                    {reply_markup: {
                        keyboard:[
                            metersForKeyboard,
                            [
                                {text:"Закрити" }
                                ]
                        ],
                        
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
                    return ctx.wizard.next();
                }
            })
        }else{
            ctx.reply('Виберіть особовий рахунок зі списку!',
            {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
            }
            });
            return ctx.scene.leave()
    }
    
})

const choseMeter = Telegraf.on("text", async (ctx) => {
    let regex1 =/^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9.:", ]+$/g;
    regex1.lastIndex = 0;
    if(regex1.exec(ctx.message.text)!=null){
        let curentMeter = ctx.message.text.split(' ')[0];

        let query= `SELECT *
            FROM meters
            WHERE id_meters = ${curentMeter}`;
            connection.query(query, async(err, result) => {
                if (err) {
                    console.log("internal error", err);
                    return;
                }
                let parseRes = JSON.parse(JSON.stringify(result));

                if(parseRes!=undefined&&parseRes.length!=0){
                    ctx.session.curentMeter = curentMeter;
                    ctx.reply('Введіть новий показник в форматі 0.00',
                    {reply_markup: {
                        keyboard:[
                            [
                            {text:"Закрити" }
                            ]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
    
                    return ctx.wizard.next();
                }else{
                    ctx.reply('Виберіть лічильник зі списку!',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                }
            })

    }else{
        ctx.reply('Виберіть лічильник зі списку!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
        }
        });
        return ctx.scene.leave()
    }
    
})


const newReading = Telegraf.on("text", async (ctx) => {
    if(isNaN(ctx.message.text)){
        ctx.reply('Введіть новий показник ще раз в правильному форматі 0.00 !',
        {reply_markup: {
            keyboard:[
                [
                {text:"Закрити" }
                ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });
    }else{
            
            let newReadingsQuery = `INSERT INTO readings ( id_meter_reading, reading, source, reading_date) 
            VALUES ('${ctx.session.curentMeter}','${Number(ctx.message.text)}','${'Teлеграм'}','${formatDate(new Date())}')`;
            connection.query(newReadingsQuery, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });

            let updateLastReadingMeters = 
            `UPDATE meters
            SET last_readinng = '${Number(ctx.message.text)}', last_readinng_date = '${formatDate(new Date())}'
            WHERE id_meters = '${ctx.session.curentMeter}';`;
            connection.query(updateLastReadingMeters, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });

        ctx.reply('Ваші показники прийняті!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });

        return ctx.scene.leave();
    }

})


const readingsScene = new WizardScene("readingsScene",addNewReadinStart,chosePersAc,choseMeter,newReading )
const readingsstage = new Stage([readingsScene]);
readingsstage.hears('Закрити',ctx =>{ 
    ctx.scene.leave('readingsScene');

    ctx.reply('Виберіть функцію',
    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
        one_time_keyboard:true
    }
    });
    })

bot.use(readingsstage.middleware());

bot.hears('Передати показники', async ctx => {

    let queryAc = `SELECT telegrams_users.id_telegrams_users
    FROM telegrams_users
    WHERE telegram_ac_id = ${ctx.from.id} `;
connection.query(queryAc, async(err, resultAc) => {
    if (err) {
        console.log("internal error", err);
        return;
    }
    let parseRes = JSON.parse(JSON.stringify(resultAc));
    if(parseRes!=undefined&&parseRes.length!=0){
    let query = `SELECT personal_account,street,house,apartment,settlement
    FROM personal_accounts
    WHERE telegram_ac = ${parseRes[0].id_telegrams_users} `;
    ctx.session.bdTelegramAcId = parseRes[0].id_telegrams_users;
connection.query(query, async(err, resultPersAc) => {
    if (err) {
        console.log("internal error", err);
        return;
    }
    let parseResPersAc = JSON.parse(JSON.stringify(resultPersAc));

    if(parseResPersAc!=undefined&&parseResPersAc.length!=0){
        let persAccountsForKeyboard = [];

        for (let i = 0; i < parseResPersAc.length; i++) {
            const element = parseResPersAc[i];

            if(element.apartment==0){
                persAccountsForKeyboard.push({text:`Особ.рах: "${element.personal_account}" ${element.settlement}, вул.${element.street}, буд.${element.house}`})
            }else{
                persAccountsForKeyboard.push({text:`Особ.рах: "${element.personal_account}" ${element.settlement}, вул.${element.street}, буд.${element.house}, кв.${element.apartment}`})
            }
            
        }

        ctx.reply('Виберіть особовий рахунок',
        {reply_markup: {
            keyboard:[persAccountsForKeyboard,
                [
                    {text:"Закрити" }
                    ]
                ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });



        ctx.scene.enter('readingsScene');

    }else{
        ctx.reply('Спочатку будь ласка додайте особові рахунки!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });
    }


})
}
})
})
/////////







//////   Додавання особового рахунку
const settlementHandler = Telegraf.on("text", async (ctx) => {
    
    return ctx.wizard.next();
})



const persAcMeHandler = Telegraf.on("text", async (ctx) => {
    regex.lastIndex = 0;
    if(regex.exec(ctx.message.text)!=null){
        ctx.session.settlement = ctx.message.text;
        ctx.reply('Введіть ваш особовий рахунок',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Вийти" }
                    ]
                ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });
        return ctx.wizard.next();
    }else{
        ctx.reply('Вибачте, але даного населеного пунку не знайдено, виберіть його ще раз!',
        {reply_markup: {
            keyboard:[
                [
                {text:"Віньківці" },
                {text:"Карижин"},
                {text:"Подолянське"}
                ],
                [
                    {text:"Вийти" }
                    ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });

    }
})

const persAcHandler = Telegraf.on("text", async (ctx) => {
    regex.lastIndex = 0;
    if(regex.exec(ctx.message.text)!=null){
        
    
        ctx.session.persAc = ctx.message.text;
        let query = `SELECT * 
        FROM personal_accounts
        WHERE settlement = '${ctx.session.settlement}' && personal_account = '${ctx.session.persAc}'  `;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseRes = JSON.parse(JSON.stringify(result));
            if(parseRes!=undefined&&parseRes.length!=0){
                if(result[0].telegram_ac == undefined){
                    if(result[0].apartment=='0'){
                        ctx.reply(`Ваш особовий рахунок занходиться за адресою вул.${result[0].street} буд.${result[0].house}?`,
                        {reply_markup: {
                            keyboard:[
                                [
                                {text:"Так, додати особовий рахунок!" },
                                {text:"Ні"}
                                ],[
                                    {text:"Вийти" }
                                    ]
                            ],
                            resize_keyboard:true,
                            one_time_keyboard:true
                        }
                        });
                    }else{
                        ctx.reply(`Ваш особовий рахунок занходиться за адресою вул.${result[0].street} буд.${result[0].house} кв.${result[0].apartment}?`,
                        {reply_markup: {
                            keyboard:[
                                [
                                    {text:"Так, додати особовий рахунок!" },
                                    {text:"Ні"}
                                    
                                ],[
                                    {text:"Вийти" }
                                    ]
                            ],
                            resize_keyboard:true,
                            one_time_keyboard:true
                        }
                        });
                    }
                    return ctx.wizard.next();
                }else{
                    
                    ctx.reply('Вибачте, але даний особовий рахунок привязаний до іншого аккаунту телеграм',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                }
                
            }else{
                ctx.reply('Вибачте, але даного особового рахунку не знайдено, введіть особовий рахунок ще раз!',
                    {reply_markup: {
                        keyboard:[
                            [
                                {text:"Вийти" }
                                ]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
                
            }
        });   
    }else{
        ctx.reply('Вибачте, але даного особового рахунку не знайдено, введіть особовий рахунок ще раз!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Вийти" }
                    ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });

    }

        
})

const agreeHandler = Telegraf.on("text", async (ctx) => {
 
    if(ctx.message.text == "Так, додати особовий рахунок!"){
        let queryAc = `SELECT telegrams_users.id_telegrams_users
        FROM telegrams_users
        WHERE telegram_ac_id = ${ctx.from.id} `;
    connection.query(queryAc, async(err, resultAc) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(resultAc));
        let query = `UPDATE personal_accounts
        SET telegram_ac = ${parseRes[0].id_telegrams_users}
        WHERE settlement = '${ctx.session.settlement}' && personal_account = '${ctx.session.persAc}'  `;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    })
    })
    ctx.reply('Особовий рахунко додано!',
    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
        one_time_keyboard:true
    }
    });
    return ctx.scene.leave()
    }else{
        ctx.reply('Виберіть дію!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });
        return ctx.scene.leave()
    }
   
    
})

const infoScene = new WizardScene("infoScene",settlementHandler,persAcMeHandler,persAcHandler,agreeHandler)
const infostage = new Stage([infoScene]);
infostage.hears('Вийти',ctx =>{ 
    ctx.scene.leave('infoScene');  
    store.clear();
    ctx.reply('Виберіть функцію',
    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
        one_time_keyboard:true
    }
    });
    });

bot.use(infostage.middleware());

bot.hears('Додати особовий рахунок', async ctx => {
    ctx.reply('Виберіть ваш населений пункт',
    {reply_markup: {
        keyboard:[
            [
            {text:"Віньківці" },
            {text:"Карижин"},
            {text:"Подолянське"}
            ],
            [
                {text:"Вийти" }
                ]
        ],
        resize_keyboard:true,
        one_time_keyboard:true
    }
    });
    ctx.scene.enter('infoScene');
})
/////////





//// Видалення останього показника
const deletewReadingStart = Telegraf.on("text", async (ctx) => {
    return ctx.wizard.next();
    
})

const chosePersAcDelete = Telegraf.on("text", async (ctx) => {
    let regex1 =/^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9.:", ]+$/g;
    regex1.lastIndex = 0;
    if(regex1.exec(ctx.message.text)!=null){
            let curentPersAc = ctx.message.text.split(/\"(.*?)\"/gm)[1]
            ctx.session.curentPersAc = curentPersAc;
            let query= `SELECT meters.*
            FROM personal_accounts
            INNER JOIN meters
            ON personal_accounts.id_personal_account = meters.personal_account_id
            WHERE personal_account = ${ctx.session.curentPersAc}`;
            connection.query(query, async(err, result) => {
                if (err) {
                    console.log("internal error", err);
                    ctx.reply('Виберіть особовий рахунок зі списку!',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                    
                }
                let parseRes = JSON.parse(JSON.stringify(result));
                let metersForKeyboard = [];
                if(parseRes!=undefined&&parseRes.length!=0){
                    for (let i = 0; i < parseRes.length; i++) {
                        const element = parseRes[i];

                        let serilNum = 'Невідомо';
                        let location = 'Невідомо';

                        if(element.serial_number !=undefined){
                            serilNum  = element.serial_number
                        }
                        if(element.location !=undefined){
                            location = element.location
                        }
                        

                        if(element.status == "Активний"){
                            metersForKeyboard.push({text:`${element.id_meters} Серійн.ном. ліч.: ${serilNum}, місце встановлення: ${location}, останні показання: ${element.last_readinng}`})
                        }
                    }
                }
                if(metersForKeyboard.length==0){
                    ctx.reply('Вибачте, але за даним особовим рахунком немає активних лічильників',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                    
                }else{
                    ctx.reply('Виберіть лічильник',
                    {reply_markup: {
                        keyboard:[
                            metersForKeyboard,
                            [
                                {text:"Відмінити видалення" }
                                ]
                        ],
                        
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
                    return ctx.wizard.next();
                }
            })
        }else{
            ctx.reply('Виберіть особовий рахунок зі списку!',
            {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
            }
            });
            return ctx.scene.leave()
    }
    
})

const choseMeterDelete = Telegraf.on("text", async (ctx) => {
    let regex1 =/^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9.:", ]+$/g;
    regex1.lastIndex = 0;
    if(regex1.exec(ctx.message.text)!=null){
        let curentMeter = ctx.message.text.split(' ')[0];

        let query= `SELECT meters.id_meters, readings.id_reading, readings.reading, readings.reading_date
        FROM meters
        LEFT JOIN readings
        ON meters.id_meters = readings.id_meter_reading
        WHERE id_meters = '${curentMeter}' && readings.calculated='0' && readings.source = 'Teлеграм' && readings.reading_date between date('${formatDate(new Date(Date.now() - 86400000))}') and date('${formatDate(new Date())}')
        ORDER BY readings.id_reading DESC`;
            connection.query(query, async(err, result) => {
                if (err) {
                    console.log("internal error", err);
                    return;
                }
                let parseRes = JSON.parse(JSON.stringify(result));
                let readingsButons = [];
                if(parseRes!=undefined){
                    ctx.session.curentMeter = curentMeter;
                    for (let i = 0; i < parseRes.length; i++) {
                        const element = parseRes [i];
                        readingsButons.push({text:`${element.id_reading} Показник: ${element.reading} Дата подання: ${formatDate(new Date(element.reading_date))}`})
                    }
                    if(readingsButons.length==0){
                        ctx.reply('Вибачте, але ви не можете видалити жодних показників. Видалити можна лише ті показники, по яким не було здійснено нарахування та вони були подані не не раніше чим 24 години тому',
                        {reply_markup: {
                            keyboard:[
                                [
                                    {text:"Передати показники" }
                                ],
                                [
                                {text:"Видалити останній показник" },
                                {text:"Додати особовий рахунок"}
                                ],                
                                [
                                    {text:"Наш вебсайт" }
                                ]
                            ],
                            resize_keyboard:true,
                            one_time_keyboard:true
                        }
                        });
                        return ctx.scene.leave()
                    }
                    ctx.reply('Виберіть показник для видалення',
                    {reply_markup: {
                        keyboard:[
                            readingsButons,
                            [
                                {text:"Відмінити видалення" }
                                ]
                        ],
                        
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                    });
    
                    return ctx.wizard.next();
                }else{
                    ctx.reply('Виберіть лічильник зі списку!',
                    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                }
            })

    }else{
        ctx.reply('Виберіть лічильник зі списку!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
        }
        });
        return ctx.scene.leave()
    }
    
})


const chooseReadingDelete = Telegraf.on("text", async (ctx) => {
    let regex1 =/^[a-zA-ZА-яёЁЇїІіЄєҐґ0-9.:", -]+$/g;
    regex1.lastIndex = 0;
    if(regex1.exec(ctx.message.text)!=null){
        let curentReading = ctx.message.text.split(' ')[0];
        let query= `DELETE FROM readings WHERE id_reading = '${curentReading}';`;
            connection.query(query, async(err, result) => {
                if (err) {
                    ctx.reply('Вибачте, але сталася помилка і ваш показник не видалено',
                    {reply_markup: {
                        keyboard:[
                            [
                                {text:"Передати показники" }
                            ],
                            [
                            {text:"Видалити останній показник" },
                            {text:"Додати особовий рахунок"}
                            ],                
                            [
                                {text:"Наш вебсайт" }
                            ]
                        ],
                        resize_keyboard:true
                    }
                    });
                    return ctx.scene.leave()
                }
                ctx.reply('Ваш показник успішно видалений!',
                    {reply_markup: {
                        keyboard:[
                            [
                                {text:"Передати показники" }
                            ],
                            [
                            {text:"Видалити останній показник" },
                            {text:"Додати особовий рахунок"}
                            ],                
                            [
                                {text:"Наш вебсайт" }
                            ]
                        ],
                        resize_keyboard:true
                    }
                });
        });

        let querylastRead= `SELECT readings.id_reading, readings.reading, readings.reading_date
        FROM meters
        INNER JOIN readings
        ON meters.id_meters = readings.id_meter_reading
        WHERE id_meters = '${ctx.session.curentMeter}'
        ORDER BY readings.id_reading DESC 
        LIMIT 1`;
            connection.query(querylastRead, async(err, resultlastRead) => {
                if (err) {
                    console.log("internal error", err);
                    return ctx.scene.leave();
                }
                let parseReslastRead = JSON.parse(JSON.stringify(resultlastRead));
                let lastRead = null;
                let lastReadDate = null;

                if(parseReslastRead!=undefined&&parseReslastRead.length!=0){
                    lastRead = parseReslastRead[0].reading;
                    lastReadDate = parseReslastRead[0].reading_date
                }
                if(lastRead!=null){
                    let queryUpdateMeter= `UPDATE meters
                    SET last_readinng = '${lastRead}', last_readinng_date = '${formatDate( new Date(lastReadDate))}'
                    WHERE id_meters ='${ctx.session.curentMeter}'`;
                        connection.query(queryUpdateMeter, async(err, resultlastRead) => {
                            if (err) {
                                console.log("internal error", err);
                                return ctx.scene.leave()
                            }
                        })
                }else{
                    let queryUpdateMeter= `UPDATE meters
                    SET last_readinng = NULL, last_readinng_date = NULL
                    WHERE id_meters ='${ctx.session.curentMeter}'`;
                        connection.query(queryUpdateMeter, async(err, resultlastRead) => {
                            if (err) {
                                console.log("internal error", err);
                                return ctx.scene.leave()
                            }
                        })
                }
            })
            return ctx.scene.leave()
    }else{
        ctx.reply('Виберіть показник зі списку!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true
        }
        });
        return ctx.scene.leave()
    }

})


const deleteReadingsScene = new WizardScene("deleteReadingsScene",deletewReadingStart, chosePersAcDelete, choseMeterDelete, chooseReadingDelete )
const deleteReadingsstage = new Stage([deleteReadingsScene]);
deleteReadingsstage.hears('Відмінити видалення',ctx =>{ 
    ctx.scene.leave('deleteReadingsScene');

    ctx.reply('Виберіть функцію',
    {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
        one_time_keyboard:true
    }
    });
    })

bot.use(deleteReadingsstage.middleware());

bot.hears('Видалити останній показник', async ctx => {

    let queryAc = `SELECT telegrams_users.id_telegrams_users
    FROM telegrams_users
    WHERE telegram_ac_id = ${ctx.from.id} `;
connection.query(queryAc, async(err, resultAc) => {
    if (err) {
        console.log("internal error", err);
        return;
    }
    let parseRes = JSON.parse(JSON.stringify(resultAc));
    if(parseRes!=undefined&&parseRes.length!=0){
    let query = `SELECT personal_account,street,house,apartment,settlement
    FROM personal_accounts
    WHERE telegram_ac = ${parseRes[0].id_telegrams_users} `;
    ctx.session.bdTelegramAcId = parseRes[0].id_telegrams_users;
connection.query(query, async(err, resultPersAc) => {
    if (err) {
        console.log("internal error", err);
        return;
    }
    let parseResPersAc = JSON.parse(JSON.stringify(resultPersAc));

    if(parseResPersAc!=undefined&&parseResPersAc.length!=0){
        let persAccountsForKeyboard = [];

        for (let i = 0; i < parseResPersAc.length; i++) {
            const element = parseResPersAc[i];

            if(element.apartment==0){
                persAccountsForKeyboard.push({text:`Особ.рах: "${element.personal_account}" ${element.settlement}, вул.${element.street}, буд.${element.house}`})
            }else{
                persAccountsForKeyboard.push({text:`Особ.рах: "${element.personal_account}" ${element.settlement}, вул.${element.street}, буд.${element.house}, кв.${element.apartment}`})
            }
            
        }

        ctx.reply('Виберіть особовий рахунок',
        {reply_markup: {
            keyboard:[persAccountsForKeyboard,
                [
                    {text:"Відмінити видалення" }
                    ]
                ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });



        ctx.scene.enter('deleteReadingsScene');

    }else{
        ctx.reply('Спочатку будь ласка додайте особові рахунки!',
        {reply_markup: {
            keyboard:[
                [
                    {text:"Передати показники" }
                ],
                [
                {text:"Видалити останній показник" },
                {text:"Додати особовий рахунок"}
                ],                
                [
                    {text:"Наш вебсайт" }
                ]
            ],
            resize_keyboard:true,
            one_time_keyboard:true
        }
        });
    }


})
}
})
})
/////////


























function formatDate(date) {
    var d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
  
    return [year, month, day].join('-');
  }





exports.botStart= async () => {
bot.launch();
}