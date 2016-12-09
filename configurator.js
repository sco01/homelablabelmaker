  $( function() {

    var disk_type = $( "#disk_type" ),
    capacity = $( "#capacity" ),
    serial = $( "#serial" ),
    vendorType = 'hp';

    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
          return typeof args[number] != 'undefined'
          ? args[number]
          : match
          ;
        });
      };
    }

    function hpTypeToColor(type,speed,obj) {
      formFactor     = $('#formFactor label.ui-checkboxradio-checked');

      diskSpeedObj = obj.find('.speed');
      diskTypeObj  = obj.find('.interface');
      labelDivider = obj.find('.divider');
        
      switch (true) {
        case /^SAS$/gi.test(type):
          labelDivider.addClass('hpPurple'); break;
        case /^(SAS MDL|SATA|SATA MDL)$/gi.test(type):
          labelDivider.addClass('hpCyan'); break;
        case /^Fibre Channel$/gi.test(type):
          labelDivider.addClass('hpOrange'); break;
        case /^SSD$/gi.test(type):
          labelDivider.addClass('hpWhite'); break;
        case /SSNW/gi.test(type):
          labelDivider.addClass('hpSSNW'); break;
      }

      if ( !/(DP|Dual|Dual Port)/.test(speed)) {
        console.info ('This is a non DP Disk (' + type + ')');

        diskSpeedObj.addClass('nonDP');
      }
      
      if (/SSD/.test(type)) { diskTypeObj.text(String.fromCharCode(160)); }

    }

    function addUser() {
      diskSpeedLabel = '';
      diskSpeedDell  = '';

      formFactor     = $('#formFactor label.ui-checkboxradio-checked');
      interfaceType  = $('#interfaceType label.ui-checkboxradio-checked');
      interfaceSpeed = $('#interfaceSpeed label.ui-checkboxradio-checked');
      diskSpeed      = $('#diskSpeed label.ui-checkboxradio-checked');
      diskType       = $('#diskType label.ui-checkboxradio-checked');

      console.info ('IF: ' + interfaceType.attr('for') + ' -- IFS: ' + interfaceSpeed.attr('for') + ' -- DS:' + diskSpeed.attr('for'))

      switch (interfaceSpeed.attr('for')) {
        case 'SATA2/SAS':
          if (/SATA/.test(diskType.attr('for' ))){
            diskSpeedLabel = diskSpeedLabel.concat('3G ');
          }
          break;
        case 'SATA3/SAS2':
          diskSpeedLabel = diskSpeedLabel.concat('6G '); break;
        case 'SAS3':
          diskSpeedLabel = diskSpeedLabel.concat('12G '); break;
        case 'SAS4':
          diskSpeedLabel = diskSpeedLabel.concat('22G '); break;
      }

      if (interfaceType.attr('for') === 'dualPort') {
        if (diskSpeedLabel === '') {
          diskSpeedLabel = diskSpeedLabel.concat('Dual Port ');
        } else {
          diskSpeedLabel = diskSpeedLabel.concat('DP ');
        }
      }

      if (diskSpeed.attr('for')) {
        diskSpeedLabel = diskSpeedLabel.concat(diskSpeed.attr('for'));
        diskSpeedDell  = diskSpeedDell.concat(diskSpeed.attr('for'));
      }

      if (/(SSD|SSNW)/i.test(diskType.attr('for'))) {
        diskSpeedLabel = 'SATA SSD';
      }

      var valid = true;

      switch (vendorType) {
        case 'hp': 
          console.info ('Disk Speed HP Label : ' + diskSpeedLabel);
          switch (formFactor.attr('for')) {
            case 'SFF':
              labelString = "<div class='hp SFF'><div class='speed'>{0}</div><div class='interface divider'>{1}</div><div class='capacity'>{2}</div><div class='serial'>{3}</div></div>".format(diskSpeedLabel,diskType.text(),capacity.val(),serial.val());
              break;
            case 'LFF':
              labelString = "<div class='hp LFF'><div class='speed'>{0}</div><div class='interface'>{1}</div><hr class='divider'/><div class='capacity'>{2}</div><div class='serial'>{3}</div></div>".format(diskSpeedLabel,diskType.text(),capacity.val(),serial.val());
            break;
          }
          break;
        case 'dell':
          console.info ('Disk Speed Dell Label : ' + diskSpeedDell);
          switch (formFactor.attr('for')) {
            case 'SFF':
              labelString = "<div class='dell slim'><div class='interface'>{0}</div><div class='capacity'>{1}</div><div class='speed'>{2}</div></div>".format(diskType.text(),capacity.val(),diskSpeedDell);
              break;
            case 'LFF':
              labelString = "<div class='dell wide'><div class='interface'>{0}</div><div><span class='capacity'>{1}</span> <span class='speed'>{2}</span></div></div>".format(diskType.text(),capacity.val(),diskSpeedDell);
            break;
          break;
        }
      }

/*      valid = valid && checkLength( name, "username", 3, 16 );
      valid = valid && checkLength( email, "email", 6, 80 );
      valid = valid && checkLength( password, "password", 5, 16 );
 
      valid = valid && checkRegexp( name, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
      valid = valid && checkRegexp( email, emailRegex, "eg. ui@jquery.com" );
      valid = valid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
 
      if ( valid ) {*/
       
        if ($('#printOutTable tr').length === 0 || $('#printOutTable tr:last td').length >= 6) { $( "#printOutTable tbody" ).append( '<tr>' ); }
        $( "#printOutTable tbody tr:last" ).append('<td>' + labelString + '</td>');
        if ($('#printOutTable tr').length === 0 || $('#printOutTable tr:last td').length >= 6) { $( "#printOutTable tbody" ).append( '</tr>' ); }

        hpTypeToColor(diskType.text(),diskSpeedLabel,$( "#printOutTable tbody tr td" ).last());

        /* Dell SSD fix */
        if (/SSD/i.test(diskType.attr('for')) && vendorType === 'dell' && formFactor.attr('for') === 'SFF') {
          console.info ('Dell SSD Fix');
          $('#printOutTable td #dellSpeed').last().remove();
          $('#printOutTable td #dellCapacity').last().css({'line-height': '0.8cm'})
        }

        if($('#addMore:checked').length === 0) {
          dialog2.dialog( "close" );
        }

      return valid;
    }

    dialog2 = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "Add disk(s)": addUser,
        Cancel: function() {
          dialog2.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
      }
    });

    dialog = $( "#vendor-select" ).dialog({
      autoOpen: false,
      height: 200,
      width: 350,
      modal: true,
      close: function() {
      }
    });


    form = dialog2.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
     btnPrintPage;
    });

    $( "#btnStartConfigurator" ).button().on( "click", function() {
      dialog.dialog( "open" );
    });

    $( "#btnPrintPage" ).button().on( "click", function() {
      preparePrint();
      window.print();
    });

    $( "#btnRestartApp" ).button().on( "click", function() {
      $( "#btnPrintPage" ).show();
      $( "#btnStartConfigurator" ).show();
      $( '#exampleContainer').show();
      $( '#instruction').show();
      $( '#printOutTable tbody').html('');
      $(this).hide();
    }).hide();

    $('table#vendors img').click(function(e) {
      dialog.dialog( "close" );
      console.info($(this).attr('id') + ' Clicked!');
      vendorType = $(this).attr('id');
      if ($(this).attr('id') === 'dell') {
        $('#interfaceType').hide();
        $('#interfaceSpeed').hide();
        $('label[for=\'SASMDL\']').hide();
        $('label[for=\'SATAMDL\']').hide();
        $('label[for=\'FC\']').hide();
        $('label[for=\'SSNW\']').hide();
      }
      dialog2.dialog( "open" );
    });

   $('#disk_type').change(function alma() {
      console.log ('Disk Typpe changed. New Type: ' + $(this).val());
      if (/SSD/gi.test($(this).val())) {
        $('#disk_speed').val('SATA SSD').prop('disabled', true).css('color', '#A0A0A0');
      } else {
        $('#disk_speed').prop('disabled', false).css('color', '#333333');
      }
    });

   $('#dialog-form input:radio').checkboxradio({
      icon: false
    });
   $('#addMore').checkboxradio();

   /*$( "[name='formFactor']").on("change", function(e) {
      var target = $( e.target );
      var checked = target.is( ":checked" );

          if (target.attr('id') === 'LFF' && checked && vendorType === 'dell') {
            $('#diskSpeed').hide();
          } else if ( $( "[name='diskType']:checked").attr('id') !== 'SSD' ) {
            $('#diskSpeed').show();
            $('[for=\'' + $('[name=\'diskSpeed\']:checked').attr('id') + '\']').addClass('ui-checkboxradio-checked ui-state-active')
          }
   });*/

   $( "[name='diskType']").on("change", function(e) {
      var target = $( e.target );
      var checked = target.is( ":checked" );

          if (target.attr('id') === 'SSD' && checked ) {
            $('#diskSpeed').hide();
            $('#diskSpeed label').removeClass('ui-checkboxradio-checked ui-state-active')
          } else /*if ( $( "[name='formFactor']:checked").attr('id') === 'SFF' )*/ {
            $('#diskSpeed').show();
            $('[for=\'' + $('[name=\'diskSpeed\']:checked').attr('id') + '\']').addClass('ui-checkboxradio-checked ui-state-active')
          }
   });
  } );

  function preparePrint() {
    $( "#btnPrintPage" ).hide();
    $( "#btnStartConfigurator" ).hide();
    $( '#exampleContainer').hide();
    $( '#instruction').hide();
    setTimeout(function() {
      $( '#btnRestartApp').show();
    },1000);
  }