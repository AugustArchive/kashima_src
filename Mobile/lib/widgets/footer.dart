/// Copyright (c) 2019-2020 LiquidBlast
/// 
/// All code contained in this software ("Software") is copyrighted by LiquidBlast and 
/// may not be used outside this project without written permission from LiquidBlast. Art 
/// assets and libraries are licensed by their respective owners.
/// 
/// Permission is hearby granted to use the Software under the following terms and conditions:
/// * You will not attempt to reverse engineer or modify the Software.
/// * You will not sell or distribute the Software under your own name without written permission
/// from LiquidBlast.
/// 
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
/// SOFTWARE.

import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:kashima/widgets/homepage.dart';
import 'package:kashima/widgets/settings.dart';
import 'package:kashima/widgets/player.dart';
import 'package:kashima/widgets/user.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class ApplicationFooter extends StatelessWidget {
  @override
  Widget build(BuildContext ctx) => Row(
    children: <Widget>[
      IconButton(
        icon: FaIcon(FontAwesomeIcons.home),
        onPressed: () {
          Navigator.push(ctx, MaterialPageRoute(
            builder: (BuildContext ctx) => Homepage()
          ));
        },
      ),
      IconButton(
        icon: FaIcon(FontAwesomeIcons.music),
        onPressed: () {
          Navigator.push(ctx, MaterialPageRoute(
            builder: (BuildContext ctx) => MusicPlayer()
          ));
        }
      ),
      IconButton(
        icon: FaIcon(FontAwesomeIcons.cogs),
        onPressed: () {
          Navigator.push(ctx, MaterialPageRoute(
            builder: (BuildContext ctx) => Settings()
          ));
        }
      ),
      IconButton(
        icon: FaIcon(FontAwesomeIcons.user),
        onPressed: () {
          Navigator.push(ctx, MaterialPageRoute(
            builder: (BuildContext ctx) => Userpage()
          ));
        }
      ),
    ],
  );
}