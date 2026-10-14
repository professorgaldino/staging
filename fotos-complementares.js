// Cadastre somente as fotos ausentes no catálogo atual.
// Formato: { ra: 'RA sem dígito', digit: 'dígito', foto: 'link do arquivo ou ID do Drive' }
// O vínculo usa o RA; não depende do número de chamada nem de parte do nome.
// IDs conferidos na pasta pública do 7A em 14/10/2026.
// O RA do nome do arquivo inclui o dígito; ele é separado aqui.
const arquivos7A = {
  '000114295061X':'1yElFlEWfTUOoCdab29LvRsZOIWh5jYQz',
  '000115956680X':'1nO2cVmGaydbIzdMJ7F2byPBgUDVDGjqG',
  '000116816767X':'1uHTUoQpkkVORhhVtcvH29RcxnJtQJQof',
  '000120041102X':'1OJ1CvTtCDFkQIAwiYx_enSHp5i6C_j8P',
  '0001138608026':'1mXpz3O9eUSRIeIRnVv1avmSjI0BcUOIR',
  '0001140250371':'1zkjJtLzJQyXJjoPwk6e_6veNJx-RKZzl',
  '0001142893042':'1jNwcsBlFfc_xYEg2cib7mSpvCL05OgMY',
  '0001143291025':'1zB_q5FVyr7-Ax3g2fI4neApmZsnU68ND',
  '0001143304780':'1pPHN-QqHTNcdQY8PZ1HiStZMhuUFrBtb',
  '0001144182530':'1WE-q0asuTKiNQzP0a69yKggGMKXZn3HD',
  '0001151194153':'1WV8-vjt7vP-spVAGPL2S_WHM1NW9imQ5',
  '0001151246244':'17mm0KEGVFUY2dLNpsOBgTfmSPS8aYltI',
  '0001151660565':'165h265DUV0T9hcaqnFGeDAKrgq3xuDfn',
  '0001151688733':'1wiumwOglP4JoxSSP47gEkVQVjTadcTln',
  '0001152415244':'1HUrMUmKYJCipKTQWfY51_GyVy1_IhdPl',
  '0001159392985':'1pdPo8AqNj2eBV5mU6WPfjWcL5saG0HeI',
  '0001161628125':'1RcKXHnZuwaA9zDGchQM9m-xwdSuYi5fS',
  '0001163325880':'1uJY89lG2rUACU9NlsSLrAL166kYrED7i',
  '0001163474915':'11D7amzDjA89Q97ak38FXa1GU4EBf1OIP',
  '0001164052998':'19QXoiA5fYGXR6J0umgWCi5MYWpJo0EE4',
  '0001165115712':'1HWcRkhysazMrRL_58ZU3EL0p1Hee9bfx',
  '0001165601680':'1CV8bI9IvKhS1jFriscyHf95Q3I07gm6k',
  '0001166141585':'1DCNoC09XtYGtJXyDIzKca3zVQFXq5_PG',
  '0001166188930':'1K7D6DC5HhZUIl1llqMLGCM7l7nxqNSCW',
  '0001167008388':'1UomUoVV_2m4wUp3SfyuvG8WdkbdeLBKl',
  '0001167055226':'1xhlSMr7fKN0OBY1KIYntwRkSevz0-Vsx',
  '0001167756976':'10JPORj6mK0DVZymUhhuIZAk12cSIe0D7',
  '0001200304779':'1mXEdwuNXzW3En4cgABqsqHHC3lrVNrdN',
  '0001200380897':'1chFr-95mX-sfyl1_xfSvg3CTkTINvHQH',
  '0001200398087':'1im3qYGh0nVhz23jihSMcQpZmNKBoE_LB',
  '0001200402066':'19_w5_9DNYZPEQvj72lBSq0VfRaaRlBGc',
  '0001200404828':'1AwQqmL9Tt5k5fXI2rqSkEoxcjvLpuArT',
  '0001200993998':'1qHJpUDPO8pVJLAEL39w93dz3_tg5qBxq',
  '0001201619877':'1JHLa55kBkEGeP-kbeFCYPTI-T8Y_uol9',
  '0001201925009':'1e0MjWLnDFUrBt0eMunys9bcCaVS8hMjG',
  '0001215835528':'1uWz5rL_eoSoPngj9Vqd0HPD9AIhXVj59',
  '0001216714617':'1fXQmOrkNPdULY5CtJzOkvHdEjj-uLYkb',
  '0001247020551':'19YMrtC044mq4xvG-A5ANdqoq_UMaU52T',
  '0001247525247':'14aqtsiNE5_WoYIJNUHSJQyO1GOH9K47n',
  '0001261323439':'1N78mtzIKo9QzMa5ZVtCeAkqAPVjR0dHy'
};
export const fotosComplementares = Object.entries(arquivos7A).map(([raCompleto,foto]) => ({
  ra:raCompleto.slice(0,-1), digit:raCompleto.slice(-1), classId:'7A', foto
}));
