FROM node

RUN mkdir /riker
WORKDIR /riker
RUN curl https://raw.githubusercontent.com/ben174/rikeripsum/aaa36f92c125d089197014804fc50922289a4ae9/rikeripsum/data/riker.pickle > riker.pickle

RUN npm i -g gulp

ADD . /riker
RUN npm i

RUN gulp

CMD node dist/index --schedule="$SCHEDULE" --data=./riker.pickle
