import IODesktop from "@interopio/desktop";

const initializeIOConnect = async () => {
    const io = await IODesktop();
    const windonAny = window as any

    const channels = await io.channels.all()

    // Join hardcoded channel on which communication will be happening
    io.channels.join(channels[0])

    // join same channels if we want the message dispatch to happen through FDC3 api
    // if we use only channel api - it won,t be necessary
    windonAny.fdc3.joinUserChannel('fdc3.channel.8')

    const contextHandler = (context: any) => {
      if(context.type === 'fdc3.orderList') {
      //setup containing portfolio context object
      const portfolio: any = {
        type: 'fdc3.portfolio',
        positions: [],
      }
 
    //translate each order into a position in the portfolio
    // - we'll lose the side and CRD fields as not supported...
    context.orders.forEach((order:any) => {
      const position = {
        type: 'fdc3.position',
        instrument: order.details.product.instrument,
        holding: order.id.Size,
      };
      portfolio.positions.push(position);
    });
 
    //broadcast our translation in channels api 
    // io.channels.publish({
    //     'fdc3_fdc3&portfolio': {
    //       ...portfolio
    //     }
    //   });

    // OR

    // broadcast our translation in FDC3 api
      windonAny.fdc3.broadcast(portfolio)
    }
  }

  // this sets up the context listener that would respond and translate the message
    await io.channels.subscribe(contextHandler)
};

// The initial call, setting up the above when app is loaded
initializeIOConnect().catch(console.error);